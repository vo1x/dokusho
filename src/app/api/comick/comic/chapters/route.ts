import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const mangaId = request.nextUrl.searchParams.get("mangaId");

	if (!mangaId?.trim())
		return NextResponse.json(
			{ error: "Chapter ID is required" },
			{ status: 404 },
		);

	const url = `https://api.comick.fun/comic/${mangaId}/chapters?lang=en&limit=99999&tachiyomi=true`;
	console.log(url);

	const groupNames: Set<string> = new Set();

	try {
		const response = await fetch(url);
		const data = await response.json();
		const chapters = [];
		if (data.chapters && data.chapters.length > 0) {
			data.chapters.forEach((chapter: any) => {
				const groupNameToAdd = chapter.group_name?.pop()?.toLowerCase().trim();
				if (groupNameToAdd) groupNames.add(groupNameToAdd);
				chapters.push({
					chId: chapter.hid,
					chNum: Number.parseInt(chapter.chap),
					title: chapter.title,
					volume: chapter.vol,
					language: chapter.lang,
					createdAt: (chapter.created_at),
					isLastCh: chapter.is_the_last_chapter,
					groupName: groupNameToAdd,
				});
			});
		}
		return NextResponse.json({ chapters }, { status: 200 });
	} catch (error) {
		console.error("Error getting chapters: ", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
