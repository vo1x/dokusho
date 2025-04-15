"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { BookOpen, Bookmark, ChevronDown } from "lucide-react";
import { useAnilistData } from "@/hooks/useAnilistData";
import { AddToListModal } from "./modals/add-to-list";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useMangaStore } from "@/store/mangaStore";

export const MangaMeta = ({ mangaMeta }) => {
	const router = useRouter();
	const [anilistId, setAnilistId] = useState(
		mangaMeta?.anilistId || mangaMeta?.malId || null,
	);
	const [isEditorOpen, setIsEditorOpen] = useState(false);

	useEffect(() => {
		if (mangaMeta) {
			useMangaStore.getState().setMetadata(mangaMeta);
		}
	}, [mangaMeta]);

	const { data: searchResults } = useQuery({
		queryKey: ["anilistSearch", mangaMeta.title],
		queryFn: async () => {
			if (anilistId) return null;

			const response = await fetch(
				`/api/anilist/search?query=${encodeURIComponent(mangaMeta.title)}`,
			);
			if (!response.ok) throw new Error("Failed to search AniList");
			return response.json();
		},
		enabled: !anilistId,
		staleTime: 24 * 60 * 60 * 1000,
		retry: 1,
	});

	useEffect(() => {
		if (searchResults?.id && !anilistId) {
			setAnilistId(searchResults.id);
			toast.success("Linked to AniList successfully!");
		}
	}, [searchResults, anilistId]);

	const { data: trackerInfo, isLoading } = useAnilistData(anilistId);

	return (
		<div className="relative p-4">
			<div className="w-full max-w-screen">
				<div className="w-full">
					<div className="flex flex-col items-center justify-center gap-4 rounded-md">
						<img
							src={mangaMeta.cover.url}
							alt={mangaMeta.title}
							className="w-48 rounded-xl object-cover"
						/>
						<div className="flex flex-col items-center gap-4">
							<div className="flex flex-col items-center gap-2">
								<div className="flex items-center gap-2">
									<span className="text-[#8bbadd] text-sm tracking-[0.3rem]">
										{mangaMeta.status.toUpperCase()}
									</span>
									<span>//</span>
									<span>{mangaMeta.type}</span>
									{anilistId && (
										<span className="ml-2 rounded bg-[#2B2D42] px-1.5 py-0.5 text-xs text-[#5BADDF]">
											AL
										</span>
									)}
								</div>
								<span className="line-clamp-2 w-full text-center font-semibold text-lg">
									{mangaMeta.title}
								</span>
							</div>
							<p className="line-clamp-2 text-[#747c88]">
								{mangaMeta.synopsis}
							</p>

							<div className="flex items-center gap-4">
								<button
									onClick={() =>
										router.push(
											`/read?mangaId=${mangaMeta.mangaID}&chapterId=${mangaMeta?.firstChapter?.hid}&anilistId=${anilistId || ""}&chNum=1`,
										)
									}
									className="flex h-12 min-w-38 items-center justify-center space-x-2 rounded-md bg-dokusho-button-primary p-2 px-4 text-lg"
								>
									<BookOpen size={18} />
									<span>Start Reading</span>
								</button>

								<button
									onClick={() => setIsEditorOpen((prev) => !prev)}
									className={cn(
										"flex h-12 min-w-38 items-center justify-center gap-2 rounded-md bg-dokusho-button-secondary p-2 px-4 text-lg text-rosepine-moon-foam",
										{
											"opacity-50":
												!trackerInfo?.mediaListEntry?.status && !anilistId,
										},
									)}
									disabled={!trackerInfo?.mediaListEntry?.status && !anilistId}
								>
									<Bookmark size={18} fill="#9ccfd8" />
									<span className="capitalize">
										{trackerInfo?.mediaListEntry?.status?.toLowerCase() ||
											"Add to List"}
									</span>
									<ChevronDown />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			{isEditorOpen &&
				!isLoading &&
				typeof window === "object" &&
				createPortal(
					<AddToListModal
						isOpen={true}
						trackerInfo={trackerInfo}
						anilistId={anilistId}
						onClose={() => setIsEditorOpen(false)}
					/>,
					document.body,
				)}
		</div>
	);
};
