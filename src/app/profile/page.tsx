"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import type { MangaStatus } from "@/types/types";

export default function Profile() {
	const { data: session, status } = useSession();
	const [mangaItems, setMangaItems] = useState([]);
	const [selectedTab, setSelectedTab] = useState<MangaStatus>("CURRENT");

	const handleTabSelect = (filter: MangaStatus) => {
		if (filter) setSelectedTab(filter);
	};

	useEffect(() => {
		async function fetchManga() {
			try {
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
			}
		}

		fetchManga();
	}, [status, session]);
	if (status === "loading") return <div>Loading user profile...</div>;

	if (status === "unauthenticated")
		return <div>Please login in []button goes here </div>;

	if (!session) return <div>please login</div>;

	return (
		<div className="flex flex-col gap-8 p-8">
			<div className="flex items-end gap-2">
				<Image
					src={session.user.image}
					width={128}
					height={128}
					alt="user profile"
				/>
				<span className="font-semibold text-2xl">{session.user.name}</span>
			</div>

			<div>
				<button onClick={() => handleTabSelect("CURRENT")}>Reading</button>
				<button onClick={() => handleTabSelect("PLANNING")}>
					Plan to Read
				</button>
			</div>
			<div className="w-full overflow-x-auto">
				<table className="min-w-full border-collapse overflow-hidden rounded-md bg-rosepine-surface">
					<thead className="bg-rosepine-overlay">
						<tr>
							<th className="px-4 py-2 text-left text-rosepine-text">Cover</th>
							<th className="px-4 py-2 text-left text-rosepine-text">Title</th>
							<th className="px-4 py-2 text-left text-rosepine-text">
								Progress
							</th>
							<th className="px-4 py-2 text-left text-rosepine-text">Score</th>
							<th className="px-4 py-2 text-left text-rosepine-text">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{mangaItems
							.filter((manga) => manga.status === selectedTab)
							.flatMap((manga) => manga.entries || [])
							.map((entry) => (
								<tr
									key={entry.id || entry.mediaId}
									className="border-rosepine-overlay border-t hover:bg-rosepine-highlight-low"
								>
									<td className="px-4 py-2">
										{entry.media?.coverImage?.medium ? (
											<Image
												src={entry.media.coverImage.medium}
												alt={
													entry.media?.title?.english ||
													entry.media?.title?.romaji ||
													"Manga cover"
												}
												width={50}
												height={75}
												className="rounded-sm object-cover"
											/>
										) : (
											<div className="h-[75px] w-[50px] rounded-sm bg-rosepine-highlight-med" />
										)}
									</td>
									<td className="px-4 py-2">
										<div className="font-medium">
											{entry.media?.title?.english ||
												entry.media?.title?.romaji ||
												`Manga #${entry.id}`}
										</div>
										<div className="text-rosepine-subtle text-sm">
											{entry.media?.title?.romaji}
										</div>
									</td>
									<td className="px-4 py-2">
										<div className="text-rosepine-foam">
											{entry.progress}{" "}
											{entry.media?.chapters ? `/ ${entry.media.chapters}` : ""}{" "}
											chapters
										</div>
										{entry.progressVolumes > 0 && (
											<div className="text-rosepine-subtle text-sm">
												{entry.progressVolumes}{" "}
												{entry.media?.volumes ? `/ ${entry.media.volumes}` : ""}{" "}
												volumes
											</div>
										)}
									</td>
									<td className="px-4 py-2">
										<div className="flex items-center gap-1">
											<span className="text-rosepine-gold">{entry.score}</span>
											{entry.score > 0 && (
												<span className="text-rosepine-gold text-sm">/10</span>
											)}
										</div>
									</td>
									<td className="px-4 py-2">
										<div className="flex gap-2">
											<a
												href={`/manga/${entry.mediaId}`}
												className="rounded-md bg-rosepine-pine px-3 py-1 text-rosepine-text text-sm hover:bg-rosepine-pine/80"
											>
												View
											</a>
											<button
												className="rounded-md bg-rosepine-overlay px-3 py-1 text-rosepine-text text-sm hover:bg-rosepine-highlight-med"
												onClick={() => {
													/* Handle edit action */
												}}
											>
												Edit
											</button>
										</div>
									</td>
								</tr>
							))}
						{mangaItems
							.filter((manga) => manga.status === selectedTab)
							.flatMap((manga) => manga.entries || []).length === 0 && (
							<tr>
								<td
									colSpan={5}
									className="px-4 py-8 text-center text-rosepine-muted"
								>
									No manga found in this category
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
