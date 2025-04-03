import { MangaMeta } from "@/components/manga-meta";

import { ChapterList } from "@/components/chapter-list";

export default async function Manga({
	params,
}: { params: Promise<{ id: string }> }) {
	const { id: mangaId } = await params;

	const response = await fetch(
		`http://localhost:3000/api/comick/comic/details?mangaId=${mangaId}`,
	);
	const mangaMeta = await response.json();

	return (
		<div className="flex flex-col">
			<MangaMeta mangaMeta={mangaMeta} />
			<ChapterList
				comicKId={mangaMeta.mangaID}
				anilistId={mangaMeta?.anilistId || mangaMeta?.malId}
			/>
		</div>
	);
}
