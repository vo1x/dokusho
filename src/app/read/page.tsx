// implement passing down anilist tracker info through the url or some other way

"use client";

import {
	useState,
	useEffect,
	useRef,
	useMemo,
	type KeyboardEvent,
} from "react";

import { useSearchParams, useRouter } from "next/navigation";

import { toast } from "sonner";

import { useAnilistData, useUpdateMangaList } from "@/hooks/useAnilistData";

import { useMangaStore } from "@/store/mangaStore";

interface Page {
	url: string;
	width: number;
	height: number;
}

export default function Reader() {
	const searchParams = useSearchParams();
	const [showNav, setShowNav] = useState(true);
	const lastTapRef = useRef(0);

	const [pages, setPages] = useState<Page[]>([]);
	const [loadedImages, setLoadedImages] = useState(0);
	const [currentPage, setCurrentPage] = useState(0);

	const mangaId = searchParams.get("mangaId");
	const chapterId = searchParams.get("chapterId");
	const anilistId = searchParams.get("anilistId");
	const chNum = searchParams.get("chNum");
	const status = searchParams.get("status");

	const hasUpdatedRef = useRef(false);
	const hasReachedEndRef = useRef(false);

	const currentChapterNumber = Number.parseInt(chNum || "0");

	const { data: anilistData, isLoading: isLoadingAnilist } = useAnilistData(
		anilistId || "",
	);

	const updateProgress = useUpdateMangaList();

	const chapters = useMangaStore((s) => s.chapters);
	const getNextChapter = useMangaStore((s) => s.getNextChapter);
	const getPrevChapter = useMangaStore((s) => s.getPrevChapter);

	const [navReady, setNavReady] = useState(false);

	const router = useRouter();

	useEffect(() => {
		if (chapters.length > 0 && chapterId) {
			setNavReady(true);
		} else {
			setNavReady(false);
		}
	}, [chapters, chapterId]);

	const nextChapter = useMemo(() => {
		if (navReady) {
			return getNextChapter(chapterId);
		}
		return undefined;
	}, [navReady, getNextChapter, chapterId]);

	const prevChapter = useMemo(() => {
		if (navReady) {
			return getPrevChapter(chapterId);
		}
		return undefined;
	}, [navReady, getPrevChapter, chapterId]);

	const handleTap = () => {
		const now = Date.now();
		const DOUBLE_TAP_DELAY = 300;

		if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
			setShowNav((prev) => !prev);
			lastTapRef.current = 0;
		} else {
			lastTapRef.current = now;
		}
	};

	useEffect(() => {
		document.body.style.setProperty("--nav-translate", showNav ? "0" : "-100%");

		return () => {
			document.body.style.removeProperty("--nav-translate");
		};
	}, [showNav]);

	useEffect(() => {
		hasUpdatedRef.current = false;
		hasReachedEndRef.current = false;
	}, [chapterId, anilistId]);

	useEffect(() => {
		const fetchPages = async () => {
			const response = await fetch(`/api/comick/pages?chapterId=${chapterId}`);
			const data = await response.json();
			setPages(data.pages || []);
		};

		if (chapterId) fetchPages();
	}, [mangaId, chapterId]);

	useEffect(() => {
		if (loadedImages < pages.length || pages.length === 0) return;

		const handleScroll = () => {
			const scrollTop = window.scrollY;
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;
			const currentScrollPercentage =
				(scrollTop + windowHeight) / documentHeight;

			const newCurrentPage = Math.floor(currentScrollPercentage * pages.length);
			setCurrentPage(Math.min(newCurrentPage, pages.length - 1));

			if (newCurrentPage === pages.length - 1) {
				setShowNav(true);

				if (!hasReachedEndRef.current && status === "CURRENT") {
					hasReachedEndRef.current = true;
					handleProgressUpdate();
				}
			}
		};

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [loadedImages, pages.length, status]);

	const handleProgressUpdate = async () => {
		if (!anilistData || !anilistId || hasUpdatedRef.current) return;

		const currentProgress = anilistData.mediaListEntry?.progress || 0;

		if (currentChapterNumber <= currentProgress) {
			console.warn("Current progress is higher");
			return;
		}

		try {
			await updateProgress.mutateAsync({
				anilistId: anilistId,
				progress: currentChapterNumber,
			});

			hasUpdatedRef.current = true;
			toast.success(`Tracker progress updated to: ${currentChapterNumber}`);
			console.log("UPDATED CHAPTER PROGRESS TO: ", currentChapterNumber);
		} catch (error) {
			hasUpdatedRef.current = false;
			toast.error("Error updating progress");
			console.error("Error updating progress: ", error);
		}
	};

	useEffect(() => {
		const handleToggleUI = (event: KeyboardEvent) => {
			if (event.key.toLowerCase() === "m") {
				setShowNav((prev) => !prev);
			}
		};

		document.addEventListener("keydown", handleToggleUI);
		return () => document.removeEventListener("keydown", handleToggleUI);
	}, []);

	return (
		<div
			className="relative min-h-screen bg-dokusho-base reader-page"
			onClick={handleTap}
			style={{ touchAction: "manipulation" }}
		>
			<div
				className="flex max-w-full flex-col"
				style={{ touchAction: "manipulation" }}
			>
				{pages.length > 0 ? (
					pages.map((page, index) => (
						<img
							key={index}
							onLoad={() =>
								setLoadedImages((prev) =>
									prev > pages.length ? pages.length : prev + 1,
								)
							}
							src={page.url}
							alt={`Page ${index + 1}`}
							className="w-full h-auto max-w-full object-contain"
							loading="lazy"
							style={{ touchAction: "manipulation" }}
						/>
					))
				) : (
					<div className="w-full h-screen flex items-center justify-center text-white">
						Loading pages...
					</div>
				)}
			</div>

			<div
				className={`
        fixed bottom-0 left-0 right-0 pb-4 z-20
        transition-all duration-300
        flex flex-col
    `}
				style={{
					height: "6rem",
					opacity: showNav ? 1 : 0,
					transform: showNav ? "translateY(0)" : "translateY(100%)",
					background: showNav
						? "rgba(15, 23, 42, 0.95)"
						: "rgba(15, 23, 42, 0)",
					backdropFilter: showNav ? "blur(12px)" : "blur(0)",
					borderTopLeftRadius: showNav ? "1rem" : "0",
					borderTopRightRadius: showNav ? "1rem" : "0",
					overflow: "hidden",
					transition:
						"transform 0.3s ease-out, opacity 0.2s ease-out, background 0.2s ease-out, backdrop-filter 0.2s ease-out, border-radius 0.2s ease-out",
				}}
			>
				<div className="relative flex flex-col justify-end h-full px-6">
					<div
						className={`
                flex flex-col items-center transition-all duration-300
                ${showNav ? "opacity-100 translate-y-0 delay-150" : "opacity-0 -translate-y-2 pointer-events-none"}
            `}
						style={{
							transition: "opacity 0.3s, transform 0.4s",
						}}
					>
						{showNav && (
							<span className="text-sm font-medium text-[#E2E8F0]">
								Chapter {currentChapterNumber} &bull; Page {currentPage + 1} /{" "}
								{pages.length}
							</span>
						)}
					</div>
					<div
						className={`
                flex items-center w-full gap-4 transition-all duration-300
                ${showNav ? "opacity-100 translate-y-0 delay-300" : "opacity-0 translate-y-4 pointer-events-none"}
            `}
						style={{
							height: showNav ? "2.5rem" : 0,
							overflow: "hidden",
							transition:
								"opacity 0.3s 0.1s, transform 0.4s 0.1s, height 0.5s cubic-bezier(0.4,0,0.2,1)",
						}}
					>
						{showNav && (
							<>
								<button
									type="button"
									className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#475569] to-[#64748B] hover:from-[#334155] hover:to-[#475569] disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-[#475569]/20 disabled:shadow-none"
									onClick={() => {
										if (prevChapter) {
											router.push(
												`/read?mangaId=${mangaId}&chapterId=${prevChapter.chId}&anilistId=${anilistId}&chNum=${prevChapter.chNum}&status=${status}`,
											);
										}
									}}
									disabled={!prevChapter}
									aria-label="Previous Chapter"
								>
									<span className="text-white font-medium">Prev</span>
								</button>
								<div className="flex-1 flex items-center">
									<div className="w-full bg-[#1E293B]/50 rounded-full h-2 transition-all duration-500">
										<div
											className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-full transition-all duration-500 shadow-glow"
											style={{
												height: "100%",
												width: `${((currentPage + 1) / pages.length) * 100}%`,
												boxShadow: "0 0 8px rgba(59, 130, 246, 0.4)",
											}}
										/>
									</div>
								</div>
								<button
									type="button"
									className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] hover:from-[#2563EB] hover:to-[#3B82F6] disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-[#3B82F6]/20 disabled:shadow-none"
									onClick={() => {
										if (nextChapter) {
											router.push(
												`/read?mangaId=${mangaId}&chapterId=${nextChapter.chId}&anilistId=${anilistId}&chNum=${nextChapter.chNum}&status=${status}`,
											);
										}
									}}
									disabled={!nextChapter}
									aria-label="Next Chapter"
								>
									<span className="text-white font-medium">Next</span>
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
