"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BookOpen, Bookmark, ChevronDown } from "lucide-react";

import { useAnilistData } from "@/hooks/useAnilistData";

import { AddToListModal } from "./modals/add-to-list";
import { createPortal } from "react-dom";

type MangaStatus = "CURRENT" | "COMPLETED" | "PLANNING" | "PAUSED" | "DROPPED";

interface ITrackerInfo {
	status: null | MangaStatus;
}

export const MangaMeta = ({ mangaMeta }) => {
	const router = useRouter();
	// const [trackerInfo, setTrackerInfo] = useState({
	// 	status: null,
	// 	progress: 0,
	// 	score: 0,
	// 	startedAt: { year: null, month: null, day: null },
	// 	completedAt: { year: null, month: null, day: null },
	// 	notes: "",
	// });

	const { data: trackerInfo, isLoading } = useAnilistData(
		mangaMeta?.anilistId || mangaMeta?.malId,
	);

	const [isEditorOpen, setIsEditorOpen] = useState(false);
	// useEffect(() => {
	// 	const fetchEntryInfo = async () => {
	// 		try {
	// 			const response = await fetch(
	// 				`/api/anilist/get-entry?mediaId=${mangaMeta.anilistId || mangaMeta.malId}`,
	// 			);
	// 			if (!response.ok) {
	// 				throw new Error("Failed to fetch entry info");
	// 			}

	// 			const data = await response.json();
	// 			const entry = data.mediaListEntry;

	// 			if (entry) {
	// 				setTrackerInfo({
	// 					status: entry.status || "PLANNING",
	// 					progress: entry.progress || 0,
	// 					score: entry.score || 0,
	// 					startedAt: entry.startedAt || {
	// 						year: null,
	// 						month: null,
	// 						day: null,
	// 					},
	// 					completedAt: entry.completedAt || {
	// 						year: null,
	// 						month: null,
	// 						day: null,
	// 					},
	// 					notes: entry.notes || "",
	// 				});
	// 			}
	// 		} catch (err: any) {
	// 			console.error("Error fetching entry info:", err);
	// 		}
	// 	};

	// 	if (mangaMeta.anilistId || mangaMeta.malId) {
	// 		fetchEntryInfo();
	// 	}
	// }, [mangaMeta.anilistId, mangaMeta.malId]);

	return (
		<div className="relative p-4">
			<div className="w-full max-w-screen">
				<div className="w-full">
					<div className="flex flex-col items-center justify-center gap-4 rounded-md">
						<img
							src={mangaMeta.cover.url}
							alt=""
							className="w-48 rounded-xl object-cover "
						/>
						<div className="flex flex-col items-center gap-4">
							<div className="flex flex-col items-center gap-2">
								<div className="flex items-center gap-2">
									<span className=" text-[#8bbadd] text-sm tracking-[0.3rem]">
										{mangaMeta.status.toUpperCase()}
									</span>
									<span>//</span>
									<span>{mangaMeta.type}</span>
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
											`/read?mangaId=${mangaMeta.mangaID}&chapterId=${mangaMeta?.firstChapter?.hid}&anilistId=${mangaMeta?.anilistId}&chNum=1`,
										)
									}
									className="flex h-12 min-w-38 items-center justify-center space-x-2 rounded-md bg-dokusho-button-primary p-2 px-4 text-lg "
								>
									<BookOpen size={18} />
									<span>Start Reading</span>
								</button>

								<button
									onClick={() => setIsEditorOpen((prev) => !prev)}
									className="flex h-12 min-w-38 items-center justify-center gap-2 rounded-md bg-dokusho-button-secondary p-2 px-4 text-lg text-rosepine-moon-foam"
								>
									<Bookmark size={18} fill="#9ccfd8"></Bookmark>
									<span className="capitalize">
										{trackerInfo?.mediaListEntry?.status?.toLowerCase() ||
											"Add to List"}
									</span>
									<ChevronDown></ChevronDown>
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
						onClose={() => setIsEditorOpen(false)}
					/>,
					document.body,
				)}
		</div>
	);
};
