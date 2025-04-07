import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const searchTerm = request.nextUrl.searchParams.get("q");

	let searchUrl = "https://api.comick.fun/v1.0/search";
	if (searchTerm)
		searchUrl = `https://api.comick.fun/v1.0/search?q=${encodeURIComponent(searchTerm)}`;

	try {
		const res = await fetch(searchUrl);
		if (!res.ok) throw new Error("ComicK API error");

		const data = await res.json();

		return NextResponse.json({ results: data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
