// implement passing down anilist tracker info through the url or some other way

"use client";

import { useState, useEffect, useRef, type KeyboardEvent } from "react";

import { useSearchParams } from "next/navigation";

import { toast } from "sonner";

import { useAnilistData, useUpdateMangaList } from "@/hooks/useAnilistData";

import { ArrowUp } from "lucide-react";

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

			if (
				!hasReachedEndRef.current &&
				scrollTop + windowHeight >= documentHeight - 10
			) {
				hasReachedEndRef.current = true;

				if (status !== "CURRENT") return;
				handleProgressUpdate();
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

	return (
		<div
			className="relative min-h-screen bg-black reader-page"
			onClick={handleTap}
			onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
				if (event.key.toLowerCase() === "m") {
					setShowNav((prev) => !prev);
				}
			}}
		>
			<div className="flex max-w-full flex-col">
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
						/>
					))
				) : (
					<div className="w-full h-screen flex items-center justify-center text-white">
						Loading pages...
					</div>
				)}
			</div>
			<div className="fixed bottom-0 left-0 right-0">
				<div className="relative px-2 pb-1">
					<div className="w-full bg-black/50 backdrop-blur-sm p-1 rounded-t-sm">
						<div className="w-full bg-cyan-950/50 rounded-full h-0.5">
							<div
								className="bg-cyan-400 h-0.5 rounded-full transition-all duration-300 shadow-glow"
								style={{
									width: `${((currentPage + 1) / pages.length) * 100}%`,
									boxShadow: "0 0 4px rgba(34, 211, 238, 0.4)",
								}}
							></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
