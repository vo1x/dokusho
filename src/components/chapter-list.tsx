"use client";

import { useAnilistData } from "@/hooks/useAnilistData";
import { useMangaChapters } from "@/hooks/useMangaChapters";

export const ChapterList = ({ comicKId, anilistId }) => {
	const { data: chapters, isLoading } = useMangaChapters(comicKId);

	const { data: anilistData, isLoading: isAnilistLoading } =
		useAnilistData(anilistId);
	const currentReadingProgress = anilistData?.mediaListEntry?.progress || 0;

	return (
		<div className="flex flex-col p-4">
			<div className="mb-4 flex items-center justify-between">
				<select
					name="scanlator"
					id="scanlator"
					className="rounded-md bg-dokusho-surface p-2 shadow-md outline-none"
				>
					<option value="scanlator">Scanlator</option>
				</select>
				<input
					type="text"
					placeholder="Chapter number"
					className="rounded-md bg-dokusho-surface p-2 shadow-md outline-none placeholder:text-[#747c88]"
				/>
			</div>

			{isLoading && <div>Chapters Loading</div>}

			{!isLoading && (
				<div className="flex h-full max-h-96 flex-col overflow-y-auto rounded-xl border border-[#1E2C43]">
					{chapters.length > 0 ? (
						chapters.map((chapter) => {
							const isRead = chapter.chNum <= currentReadingProgress;

							return (
								<div
									key={chapter.chId}
									className={`flex w-full flex-col gap-1 border-b border-b-dokusho-highlight-low p-4 ${
										isRead
											? "bg-dokusho-overlay/50 opacity-60"
											: "bg-dokusho-overlay"
									}`}
								>
									<span
										className={`line-clamp-1 ${
											isRead ? "text-dokusho-subtle/70" : "text-dokusho-subtle"
										}`}
									>
										Chapter {chapter.chNum}: <span>{chapter.title}</span>
									</span>
									<div className="flex items-center gap-2 text-sm">
										<span
											className={
												isRead ? "text-[#9ca3af]/60" : "text-[#9ca3af]"
											}
										>
											{chapter.createdAt}
										</span>
										<span
											className={
												isRead ? "text-[#747c88]/60" : "text-[#747c88]"
											}
										>
											//
										</span>
										<span
											className={
												isRead ? "text-[#747c88]/60" : "text-[#747c88]"
											}
										>
											{chapter.groupName}
										</span>
									</div>
								</div>
							);
						})
					) : (
						<div className="p-4">No chapters lil bro</div>
					)}
				</div>
			)}
		</div>
	);
};
