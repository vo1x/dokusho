// implement passing down anilist tracker info through the url or some other way
// implement toast to tell the user that the update has happened/failed

"use client";

import { useState, useEffect, useRef } from "react";

import { useSearchParams } from "next/navigation";

import { toast } from "sonner";

import {
	useAnilistData,
	useUpdateMangaList,
} from "@/hooks/useAnilistData";

export default function Reader() {
	const searchParams = useSearchParams();

	const [pages, setPages] = useState([]);
	const [loadedImages, setLoadedImages] = useState(0);
	const [isChapterComplete, setIsChapterComplete] = useState(false);

	// Get the query parameters
	const mangaId = searchParams.get("mangaId");
	const chapterId = searchParams.get("chapterId");
	const anilistId = searchParams.get("anilistId");
	const chNum = searchParams.get("chNum");

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
			if (!isChapterComplete || !anilistData || !anilistId) return;

			const currentProgress = anilistData.mediaListEntry?.progress || 0;

			if (currentChapterNumber <= currentProgress) {
				console.warn("CUrrent progress is higher");
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
	}, [isChapterComplete]);

	return (
		<div>
			<div>
				{isLoadingAnilist ? (
					"Loading..."
				) : (
					<span>
						Tracking: {anilistData?.mediaListEntry?.progress || 0}
						Current: {currentChapterNumber}
					</span>
				)}
			</div>

			{loadedImages}
			{JSON.stringify(isChapterComplete)}
			<div className="flex max-w-screen flex-col gap-2">
				{pages.length > 0 ? (
					pages.map((page) => (
						<img
							onLoad={() =>
								setLoadedImages((prev) =>
									prev > pages.length ? pages.length : prev + 1,
								)
							}
							src={page.url}
						/>
					))
				) : (
					<div>nothing to shoe</div>
				)}
			</div>
			<div className="mt-4 flex flex-col items-center gap-2">
				<button>Previous chapter</button>
				<button>Next Chapter</button>
			</div>
		</div>
	);
}
