"use client";

import { useState, useEffect } from "react";

export const ChapterList = ({ comicKId }) => {
	const [chapters, setChapters] = useState([]);

	if (!comicKId) return <div>No chapters available.</div>;

	useEffect(() => {
		const fetchChapters = async () => {
			const response = await fetch(
				`/api/comick/comic/chapters?mangaId=${comicKId}`,
			);
			if (!response.ok) return null;

			const data = await response.json();
			setChapters(data.chapters);
		};

		if (comicKId) fetchChapters();
	}, [comicKId]);

    

	return (
		<div className="flex flex-col ">
			<div className="mb-4 flex items-center justify-between">
				<select
					name="scanlator"
					id=""
					className=" rounded-md bg-dokusho-surface p-2 shadow-md outline-none"
				>
					<option value="scanlator">Scanlator</option>
				</select>
				<input
					type="text"
					placeholder="Chapter number"
					className="rounded-md bg-dokusho-surface p-2 shadow-md outline-none placeholder:text-[#747c88]"
				/>
			</div>
			<div className="flex h-full max-h-96 flex-col overflow-y-auto rounded-xl border border-[#1E2C43]">
				{chapters?.length > 0 ? (
					chapters.map((chapter) => {
						return (
							<div className="flex w-full flex-col gap-1 border-b border-b-dokusho-highlight-low bg-dokusho-overlay p-4">
								<span className="line-clamp-1 text-dokusho-subtle">
									Chapter {chapter.chNum}: <span>{chapter.title}</span>
								</span>
								<div className="flex items-center gap-2 text-[#747c88] text-sm">
									<span className="text-[#9ca3af]">{chapter.createdAt}</span>
									<span>//</span>
									<span>{chapter.groupName}</span>
								</div>
							</div>
						);
					})
				) : (
					<div>No chapters lil bro</div>
				)}
			</div>
		</div>
	);
};
