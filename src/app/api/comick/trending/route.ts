import { NextResponse } from "next/server";

export async function GET() {
	try {
		const url = "https://api.comick.io/top";

		const response = await fetch(url, {
			next: { revalidate: 36000 },
		});

		if (!response.ok) {
			throw new Error(`COMICK API error: ${response.statusText}`);
		}

		const data = await response.json();

		const sanitizeResults = data.rank.map((manga) => {
			return {
				slug: manga.slug,
				title: manga.title,
				// Add genre parsing
				genres: manga.genres,
				cover: {
					width: manga.md_covers[0].w,
					height: manga.md_covers[0].h,
					url: `https://meo.comick.pictures/${manga.md_covers[0].b2key}`,
				},
			};
		});

		return NextResponse.json([...sanitizeResults]);
	} catch (error) {
		console.error("Error fetching trending manga:", error);
		return NextResponse.json(
			{ error: "Failed to fetch trending manga" },
			{ status: 500 },
		);
	}
}
