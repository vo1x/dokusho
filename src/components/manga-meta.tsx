"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { BookOpen, Bookmark, ChevronDown } from "lucide-react";

import { useAnilistData } from "@/hooks/useAnilistData";

import { AddToListModal } from "./modals/add-to-list";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export const MangaMeta = ({ mangaMeta }) => {
	const router = useRouter();

	const { data: trackerInfo, isLoading } = useAnilistData(
		mangaMeta?.anilistId || mangaMeta?.malId,
	);

	console.log(mangaMeta);
	const [isEditorOpen, setIsEditorOpen] = useState(false);

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
									className={cn(
										"flex h-12 min-w-38 items-center justify-center gap-2 rounded-md bg-dokusho-button-secondary p-2 px-4 text-lg text-rosepine-moon-foam",
										{
											"opacity-50": !trackerInfo?.mediaListEntry?.status,
										},
									)}
									disabled={!trackerInfo?.mediaListEntry?.status}
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
						onClose={() => setIsEditorOpen(false)}
					/>,
					document.body,
				)}
		</div>
	);
};
