"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Pencil, Star, BookOpen, Eye } from "lucide-react";

import { AddToListModal } from "@/components/modals/add-to-list";

import { createPortal } from "react-dom";

import type { MangaStatus, IMangaListEntry } from "@/types/types";
import { useAnilistData } from "@/hooks/useAnilistData";

interface MangaEntry {
	id: number;
	mediaId: number;
	progress: number;
	progressVolumes: number;
	score: number;
	status: MangaStatus;
	media?: {
		title?: {
			english?: string;
			romaji?: string;
		};
		coverImage?: {
			medium?: string;
		};
		chapters?: number;
		volumes?: number;
	};
}

interface MangaList {
	status: MangaStatus;
	entries?: MangaEntry[];
}

export default function Profile() {
	const { data: session, status } = useSession();
	const [mangaItems, setMangaItems] = useState<MangaList[]>([]);
	const [selectedTab, setSelectedTab] = useState<MangaStatus>("CURRENT");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

	const {data: selectedEntry, isLoading:isAnilistLoading } = useAnilistData(selectedEntryId)

	const handleTabSelect = (filter: MangaStatus) => {
		if (filter) setSelectedTab(filter);
	};

	useEffect(() => {
		async function fetchManga() {
			try {
				setIsLoading(true);
				setError(null);
				if (status === "authenticated" && session) {
					const response = await fetch("/api/anilist/list");
					const data = await response.json();
					if (!response.ok) {
						throw new Error("Failed to fetch manga list");
					}
					setMangaItems(data?.comics || []);
				}
			} catch (err) {
				console.error("Failed to fetch manga list:", err);
				setError("Failed to load your manga list. Please try again later.");
			} finally {
				setIsLoading(false);
			}
		}

		fetchManga();
	}, [status, session]);

	if (status === "loading" || isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-dokusho-primary border-t-transparent"></div>
					<p className="text-dokusho-text">Loading your profile...</p>
				</div>
			</div>
		);
	}

	if (status === "unauthenticated") {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
				<h2 className="text-2xl font-bold text-dokusho-text">Please Sign In</h2>
				<p className="text-dokusho-muted">
					Sign in to view and manage your manga collection
				</p>
				<a
					href="/api/auth/signin"
					className="rounded-lg bg-dokusho-primary px-6 py-3 text-white hover:bg-dokusho-primary-light"
				>
					Sign In
				</a>
			</div>
		);
	}

	if (!session) return null;

	return (
		<div className="min-h-screen bg-dokusho-base p-4 md:p-8">
			<div className="mb-8 flex flex-col items-center gap-4 rounded-lg bg-dokusho-surface p-6 shadow-lg md:flex-row md:items-end">
				<div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-dokusho-primary">
					<Image
						src={session.user.image || "/default-avatar.png"}
						alt="Profile picture"
						fill
						className="object-cover"
					/>
				</div>
				<div className="text-center md:text-left">
					<h1 className="text-2xl font-bold text-dokusho-text">
						{session.user.name}
					</h1>
					<p className="text-dokusho-muted">{session.user.email}</p>
				</div>
			</div>

			<div className="mb-6 flex flex-wrap justify-center gap-2">
				<button
					onClick={() => handleTabSelect("CURRENT")}
					className={`rounded-lg px-4 py-2 font-medium transition-colors ${
						selectedTab === "CURRENT"
							? "bg-dokusho-primary text-white"
							: "bg-dokusho-overlay text-dokusho-text hover:bg-dokusho-highlight-med"
					}`}
				>
					Reading
				</button>
				<button
					onClick={() => handleTabSelect("COMPLETED")}
					className={`rounded-lg px-4 py-2 font-medium transition-colors ${
						selectedTab === "COMPLETED"
							? "bg-dokusho-primary text-white"
							: "bg-dokusho-overlay text-dokusho-text hover:bg-dokusho-highlight-med"
					}`}
				>
					Completed
				</button>
				<button
					onClick={() => handleTabSelect("PAUSED")}
					className={`rounded-lg px-4 py-2 font-medium transition-colors ${
						selectedTab === "PAUSED"
							? "bg-dokusho-primary text-white"
							: "bg-dokusho-overlay text-dokusho-text hover:bg-dokusho-highlight-med"
					}`}
				>
					On Hold
				</button>
				<button
					onClick={() => handleTabSelect("DROPPED")}
					className={`rounded-lg px-4 py-2 font-medium transition-colors ${
						selectedTab === "DROPPED"
							? "bg-dokusho-primary text-white"
							: "bg-dokusho-overlay text-dokusho-text hover:bg-dokusho-highlight-med"
					}`}
				>
					Dropped
				</button>
				<button
					onClick={() => handleTabSelect("PLANNING")}
					className={`rounded-lg px-4 py-2 font-medium transition-colors ${
						selectedTab === "PLANNING"
							? "bg-dokusho-primary text-white"
							: "bg-dokusho-overlay text-dokusho-text hover:bg-dokusho-highlight-med"
					}`}
				>
					Plan to Read
				</button>
				<button
					onClick={() => handleTabSelect("REPEATING")}
					className={`rounded-lg px-4 py-2 font-medium transition-colors ${
						selectedTab === "REPEATING"
							? "bg-dokusho-primary text-white"
							: "bg-dokusho-overlay text-dokusho-text hover:bg-dokusho-highlight-med"
					}`}
				>
					Rereading
				</button>
			</div>

			{error ? (
				<div className="rounded-lg bg-dokusho-danger/10 p-4 text-center text-dokusho-danger">
					{error}
				</div>
			) : (
				<div className="space-y-2">
					{mangaItems
						.filter((manga: MangaList) => manga.status === selectedTab)
						.flatMap((manga: MangaList) => manga.entries || [])
						.map((entry: MangaEntry) => {
							console.log('Entry:', {
								progress: entry.progress,
								totalChapters: entry.media?.chapters,
								title: entry.media?.title?.english || entry.media?.title?.romaji
							});

							const totalChapters = entry.media?.chapters;
							const currentProgress = entry.progress ?? 0;
							const progressPercentage = totalChapters 
								? Math.min((currentProgress / totalChapters) * 100, 100)
								: 100;

							return (
								<div
									key={entry.id || entry.mediaId}
									className="group relative flex items-center gap-4 rounded-lg bg-dokusho-surface p-2 transition-colors hover:bg-dokusho-highlight-med"
								>
									<a
										href={`/manga/${entry.mediaId}`}
										className="absolute inset-0 z-0"
										aria-label={`View ${entry.media?.title?.english || entry.media?.title?.romaji || `Manga #${entry.id}`}`}
									/>
									<div className="relative z-10 h-24 w-16 flex-shrink-0 overflow-hidden rounded-md">
										{entry.media?.coverImage?.medium ? (
											<Image
												src={entry.media.coverImage.medium}
												alt={
													entry.media?.title?.english ||
													entry.media?.title?.romaji ||
													"Manga cover"
												}
												fill
												className="object-cover"
											/>
										) : (
											<div className="h-full w-full bg-dokusho-highlight-med" />
										)}
									</div>
									<div className="z-10 flex-1 overflow-hidden">
										<div className="flex items-start justify-between">
											<h3 className="mb-1 truncate font-medium text-dokusho-text group-hover:text-dokusho-primary">
												{entry.media?.title?.english ||
													entry.media?.title?.romaji ||
													`Manga #${entry.id}`}
											</h3>
										</div>
										<div className="flex items-center gap-4">
											<div className="flex items-center gap-1.5 text-dokusho-subtle">
												<BookOpen className="h-4 w-4" />
												<span>{currentProgress}</span>
											</div>

											{entry.score > 0 && (
												<div className="flex items-center gap-1.5">
													<Star className="h-4 w-4 fill-dokusho-gold text-dokusho-gold" />
													<span className="text-dokusho-gold">
														{entry.score}
													</span>
												</div>
											)}
										</div>
									</div>
									<button
										className="z-10 ml-auto rounded-full p-2 text-dokusho-subtle hover:bg-dokusho-overlay hover:text-dokusho-text"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											setSelectedEntryId(entry.mediaId);
										}}
										aria-label="Edit manga entry"
									>
										<Pencil className="h-5 w-5" />
									</button>
								</div>
							);
						})}
					{mangaItems
						.filter((manga: MangaList) => manga.status === selectedTab)
						.flatMap((manga: MangaList) => manga.entries || []).length === 0 && (
						<div className="rounded-lg bg-dokusho-surface p-8 text-center">
							<p className="text-dokusho-subtle">
								No manga found in this category
							</p>
						</div>
					)}
				</div>
			)}
			{selectedEntryId && !isAnilistLoading && 
				typeof window === "object" &&
				createPortal(
					<AddToListModal
						isOpen={true}
						trackerInfo={selectedEntry}
						onClose={() => setSelectedEntryId(null)}
					/>,
					document.body,
				)}
		</div>
	);
}
