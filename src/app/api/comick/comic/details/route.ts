import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const mangaId = request.nextUrl.searchParams.get("mangaId");

	if (!mangaId?.trim())
		return NextResponse.json(
			{ error: "Manga ID is required" },
			{ status: 404 },
		);

	const url = `https://api.comick.fun/comic/${mangaId}?tachiyomi=true`;

	try {
		const response = await fetch(url);
		const data = await response.json();
		const mangaDetails = {
			mangaID: data.comic.hid,
			slug: data.comic.slug,
			malId: data.comic.links.mal || null,
			anilistId: data.comic.links.al || null,
			title: data.comic.title,
			type: data.comic.country,
			status:
				data.comic.status === 1
					? "Ongoing"
					: data.comic.status === 2
						? "Completed"
						: "Unknown",
			lastChapter: data.comic.last_chapter,
			synopsis: data.comic.parsed,
			cover: {
				width: data.comic.md_covers[0].w,
				height: data.comic.md_covers[0].h,
				url: `https://meo.comick.pictures/${data.comic.md_covers[0].b2key}`,
			},
			firstChapter: data.firstChap,
		};
		return NextResponse.json({ ...mangaDetails }, { status: 200 });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
