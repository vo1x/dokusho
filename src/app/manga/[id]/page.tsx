import { MangaMeta } from "@/components/manga-meta";

import { ChapterList } from "@/components/chapter-list";
export default async function Manga({
	params,
}: { params: Promise<{ id: string }> }) {
	const { id: mangaId } = await params;

	const response = await fetch(
		`http://localhost:3000/api/comick/comic/details?mangaId=${mangaId}`,
		{ next: { revalidate: 3600 } },
	);
	const mangaMeta = await response.json();

	return (
		<div className="flex flex-col gap-8 p-4">
			<MangaMeta mangaMeta={mangaMeta}></MangaMeta>
			<ChapterList comicKId={mangaMeta.mangaID}></ChapterList>
		</div>
	);
}
