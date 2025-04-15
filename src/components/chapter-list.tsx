"use client";

import { useAnilistData } from "@/hooks/useAnilistData";
import { useMangaChapters } from "@/hooks/useMangaChapters";
import Link from "next/link";
import { useState, useMemo, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import { toast } from "sonner";

export const ChapterList = ({ comicKId, anilistId }) => {
	const { data: chapters, isLoading } = useMangaChapters(comicKId);
	const { data: anilistData, isLoading: isAnilistLoading } =
		useAnilistData(anilistId);
	const currentReadingProgress = anilistData?.mediaListEntry?.progress || 0;

	const [searchQuery, setSearchQuery] = useState<null | string>(null);
	const [selectedScanlators, setSelectedScanlators] = useState<string[]>([]);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const scanlators = useMemo(() => {
		if (!chapters) return [];
		const uniqueScanlators = new Set(
			chapters.map((chapter) => chapter.groupName),
		);
		return Array.from(uniqueScanlators).sort();
	}, [chapters]);

	const fuse = useMemo(() => {
		if (!chapters) return null;
		return new Fuse(chapters, {
			keys: ["chNum", "title", "groupName"],
			threshold: 0.3,
		});
	}, [chapters]);

	const filteredChapters = useMemo(() => {
		if (!chapters) return [];

		let result = chapters;

		if (selectedScanlators.length > 0) {
			result = result.filter((chapter) =>
				selectedScanlators.includes(chapter.groupName),
			);
		}

		if (searchQuery && fuse) {
			const searchResults = fuse.search(searchQuery);
			result = searchResults.map((result) => result.item);
		}

		return result;
	}, [chapters, searchQuery, selectedScanlators, fuse]);

	const handleScanlatorChange = (scanlator: string) => {
		setSelectedScanlators((prev) => {
			if (scanlator === "all") {
				return [];
			}
			if (prev.includes(scanlator)) {
				return prev.filter((s) => s !== scanlator);
			}
			return [...prev, scanlator];
		});
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="flex flex-col p-4">
			<div className="mb-4 flex items-center justify-between gap-4">
				<div className="relative z-50" ref={dropdownRef}>
					<button
						type="button"
						onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						className="flex items-center gap-2 rounded-md bg-dokusho-surface px-3 py-2 text-sm text-dokusho-subtle shadow-md outline-none"
					>
						<span>Scanlators</span>
						<svg
							className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							title="Toggle dropdown"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
					{isDropdownOpen && (
						<div className="absolute left-0 top-full mt-1 w-48 rounded-md border border-dokusho-highlight-low bg-dokusho-surface p-2 shadow-lg">
							<div className="max-h-60 overflow-y-auto">
								<label className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-dokusho-overlay">
									<input
										type="checkbox"
										checked={selectedScanlators.length === 0}
										onChange={() => handleScanlatorChange("all")}
										className="h-4 w-4 rounded border-dokusho-highlight-low text-dokusho-primary focus:ring-dokusho-primary"
									/>
									<span className="text-sm text-dokusho-subtle">All</span>
								</label>
								{scanlators.map((scanlator) => (
									<label
										key={scanlator}
										className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-dokusho-overlay"
									>
										<input
											type="checkbox"
											checked={selectedScanlators.includes(scanlator)}
											onChange={() => handleScanlatorChange(scanlator)}
											className="h-4 w-4 rounded border-dokusho-highlight-low text-dokusho-primary focus:ring-dokusho-primary"
										/>
										<span className="text-sm text-dokusho-subtle">
											{scanlator}
										</span>
									</label>
								))}
							</div>
						</div>
					)}
				</div>
				<input
					type="number"
					placeholder="Search chapters..."
					value={searchQuery ?? ""}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="rounded-md bg-dokusho-surface p-2 shadow-md outline-none placeholder:text-[#747c88]"
				/>
			</div>

			{isLoading && <div>Chapters Loading</div>}

			{!isLoading && (
				<div className="flex h-full max-h-96 flex-col overflow-y-auto rounded-xl border border-[#1E2C43]">
					{filteredChapters.length > 0 ? (
						filteredChapters.map((chapter) => {
							const isRead = chapter.chNum <= currentReadingProgress;

							return (
								<Link
									key={chapter.chId}
									className={`flex w-full flex-col gap-1 border-b border-b-dokusho-highlight-low p-4 ${
										isRead
											? "bg-dokusho-overlay/50 opacity-60"
											: "bg-dokusho-overlay"
									}`}
									href={`/read?mangaId=${comicKId}&chapterId=${chapter.chId}&anilistId=${anilistId}&chNum=${chapter.chNum}&status=${anilistData?.status}`}
								>
									<span
										className={`line-clamp-1 ${
											isRead ? "text-dokusho-subtle/70" : "text-dokusho-subtle"
										}`}
									>
										{"Chapter "}
										{chapter.chNum}
										{": "}
										<span>{chapter.title}</span>
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
											{"//"}
										</span>
										<span
											className={
												isRead ? "text-[#747c88]/60" : "text-[#747c88]"
											}
										>
											{chapter.groupName}
										</span>
									</div>
								</Link>
							);
						})
					) : (
						<div className="p-4">No chapters found</div>
					)}
				</div>
			)}
		</div>
	);
};
