import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const page = searchParams.get("page") || 1;
		const orderBy = searchParams.get("orderBy");

		let url = `https://api.comick.fun/chapter?page=${page}`;
		if (orderBy) {
			url = `${url}&orderBy=${orderBy}`;
		}

		const response = await fetch(url, {
			next: { revalidate: 36000 },
		});

		if (!response.ok) {
			throw new Error(`COMICK API error: ${response.statusText}`);
		}

		const data = await response.json();

		const sanitizeResults = data.map((manga) => {
			return {
				chNum: manga.chap,
				chVol: manga.vol,
				groupName: manga.group_name,
				manga: {
					hid: manga.md_comics.hid,
					title: manga.md_comics.title,
					genres: manga.md_comics.genres,
					country: manga.md_comics.country,
					status: manga.md_comics.status,
					cover: {
						width: manga.md_comics.md_covers[0]?.w,
						height: manga.md_comics.md_covers[0]?.h,
						url: manga.md_comics.md_covers[0]?.b2key
							? `https://meo.comick.pictures/${manga.md_comics.md_covers[0].b2key}`
							: null,
					},
					count: manga.count,
				},
			};
		});

		return NextResponse.json({
			data: sanitizeResults,
			pageInfo: {
				currentPage: Number(page),
				hasNextPage: sanitizeResults.length > 0,
			},
		});
	} catch (error) {
		console.error("Error fetching manga updates:", error);
		return NextResponse.json(
			{ error: "Failed to fetch manga updates" },
			{ status: 500 },
		);
	}
}
