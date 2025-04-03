// implement passing down anilist tracker info through the url or some other way

"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAnilistData, useUpdateMangaList } from "@/hooks/useAnilistData";
import {
	ChevronLeft,
	ChevronRight,
	Menu,
	X,
	Bookmark,
	Share2,
	Settings,
	LayoutGrid,
	Home,
	Layers,
} from "lucide-react";

import Image from "next/image";

export default function Reader() {
	const searchParams = useSearchParams();

	const [pages, setPages] = useState([]);
	const [loadedImages, setLoadedImages] = useState(0);
	const [isChapterComplete, setIsChapterComplete] = useState(false);
	const [showControls, setShowControls] = useState(true);

	const mangaId = searchParams.get("mangaId");
	const chapterId = searchParams.get("chapterId");
	const anilistId = searchParams.get("anilistId");
	const chNum = searchParams.get("chNum");
	const mangaTitle = searchParams.get("title") || "Manga Title";

	const hasUpdatedRef = useRef(false);

	const currentChapterNumber = Number.parseInt(chNum) || 0;

	const { data: anilistData, isLoading: isLoadingAnilist } =
		useAnilistData(anilistId);

	const updateProgress = useUpdateMangaList();

	useEffect(() => {
		hasUpdatedRef.current = false;
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

			if (scrollTop + windowHeight >= documentHeight - 10) {
				setIsChapterComplete(true);
			}
		};

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [loadedImages, pages.length]);

	useEffect(() => {
		const handleProgressUpdate = async () => {
			console.log("isChapterComplete:", isChapterComplete);
			console.log("anilistData:", anilistData);
			console.log("anilistId:", anilistId);
			if (!isChapterComplete || !anilistData || !anilistId) return;

			const currentProgress = anilistData.mediaListEntry?.progress || 0;

			if (currentChapterNumber <= currentProgress) {
				console.warn("Current progress is higher");
				return;
			}

			if (hasUpdatedRef.current) return;

			try {
				await updateProgress.mutateAsync({
					anilistId: Number.parseInt(anilistId),
					progress: currentChapterNumber,
				});

				hasUpdatedRef.current = true;
				toast.success(`Tracker progress updated to: ${currentChapterNumber}`);
				console.log("UPDATED CHAPTER PROGRESS TO: ", currentChapterNumber);
			} catch (error) {
				hasUpdatedRef.current = false;
				toast.error("Error updating progress: ", error);

				console.error("Error updating progress: ", error);
			}
		};

		handleProgressUpdate();
	}, [
		isChapterComplete,
		anilistData,
		anilistId,
		currentChapterNumber,
		updateProgress,
	]);

	return (
		<div className="relative min-h-screen ">
			{/* Top Control Bar */}
			<div className="fixed top-0 right-0 left-0 z-50 bg-gradient-to-b from-gray-900 to-transparent p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<button className="rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700">
							<Home size={18} />
						</button>
						<div>
							<h3 className="font-medium text-sm text-white">{mangaTitle}</h3>
							<p className="text-gray-300 text-xs">
								Chapter {currentChapterNumber}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<button className="rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700">
							<Settings size={18} />
						</button>
						<button className="rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700">
							<Bookmark size={18} />
						</button>
						<button className="rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700">
							<Share2 size={18} />
						</button>
						<button className="rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700">
							<Layers size={18} />
						</button>
					</div>
				</div>
			</div>

			{/* Side Navigation Panel (hidden by default) */}
			<div className="fixed top-0 right-0 bottom-0 z-50 hidden w-64 bg-gray-900 p-4 shadow-lg">
				<div className="flex justify-end">
					<button className="rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700">
						<X size={18} />
					</button>
				</div>
				<div className="mt-6">
					<h3 className="font-semibold text-lg text-white">Chapters</h3>
					<div className="mt-2 max-h-[80vh] overflow-y-auto">
						{/* Chapter list would go here */}
						<div className="border-gray-700 border-b py-2">
							<div className="flex items-center justify-between">
								<span className="text-gray-300 text-sm">
									Chapter {currentChapterNumber + 1}
								</span>
								<span className="text-gray-500 text-xs">Next</span>
							</div>
						</div>
						<div className="border-gray-700 border-b py-2">
							<div className="flex items-center justify-between">
								<span className="font-medium text-sm text-white">
									Chapter {currentChapterNumber}
								</span>
								<span className="text-blue-400 text-xs">Current</span>
							</div>
						</div>
						<div className="border-gray-700 border-b py-2">
							<div className="flex items-center justify-between">
								<span className="text-gray-300 text-sm">
									Chapter {currentChapterNumber - 1}
								</span>
								<span className="text-gray-500 text-xs">Read</span>
							</div>
						</div>
						{/* More chapters... */}
					</div>
				</div>
			</div>

			{/* Content Area */}
			<div className="mt-16 pb-20">
				<div className="flex max-w-screen flex-col gap-2">
					{pages.length > 0 ? (
						pages.map((page, index) => (
							<Image
								key={`Page ${index + 1}`}
								className="h-auto w-full"
								onLoad={() =>
									setLoadedImages((prev) =>
										prev > pages.length ? pages.length : prev + 1,
									)
								}
								src={page.url}
								width={page.width}
								height={page.height}
								loading={index < 3 ? "eager" : "lazy"}
								alt={`Page ${index + 1}`}
							/>
						))
					) : (
						<div className="flex h-[70vh] items-center justify-center">
							<div className="text-center text-white">
								<div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-blue-500 border-t-2 border-b-2"></div>
								<p>Loading chapter...</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Bottom Control Bar */}
			<div className="fixed right-0 bottom-0 left-0 z-50 bg-gradient-to-t from-gray-900 to-transparent p-4">
				<div>
					{/* Progress indicator */}
					<div className="mb-2 flex items-center justify-between">
						<span className="text-gray-300 text-xs">
							{loadedImages} / {pages.length} pages
						</span>
						<span className="text-gray-300 text-xs">
							{isLoadingAnilist ? (
								"Loading..."
							) : (
								<span>
									Tracker: {anilistData?.mediaListEntry?.progress || 0}
								</span>
							)}
						</span>
					</div>

					{/* Progress bar */}
					<div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-gray-800">
						<div
							className="h-full bg-blue-500 transition-all duration-200"
							style={{
								width: `${(loadedImages / Math.max(pages.length, 1)) * 100}%`,
							}}
						></div>
					</div>

					{/* Navigation controls */}
					<div className="flex items-center justify-between">
						<button className="flex items-center gap-1 rounded-md bg-gray-800 px-4 py-2 text-white transition-all hover:bg-gray-700">
							<ChevronLeft size={18} />
							<span>Previous</span>
						</button>

						<div className="flex items-center gap-2">
							<button className="rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700">
								<Menu size={18} />
							</button>
							<button className="rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700">
								<LayoutGrid size={18} />
							</button>
						</div>

						<button className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-white transition-all hover:bg-blue-700">
							<span>Next</span>
							<ChevronRight size={18} />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
