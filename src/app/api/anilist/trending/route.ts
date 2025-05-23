import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams;
	const page = searchParams.get("page") || 1;

	try {
		const query = `
      query TrendingManga($page: Int, $perPage: Int) {
        Page(page:$page, perPage: $perPage) {
         pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: MANGA, sort: TRENDING_DESC, isAdult: false) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              large
              extraLarge
              medium
              color
            }
            startDate {
              year
              month
              day
            }
            status
            chapters
            format
            genres
            averageScore
            popularity
            countryOfOrigin
            isAdult
            description
            siteUrl
          }
        }
      }
    `;
		const variables = {
			page: page,
			perPage: 20,
		};

		const response = await fetch(`https://graphql.anilist.co`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				query,
				variables,
			}),
			next: { revalidate: 36000 },
		});

		if (!response.ok) {
			throw new Error(`AniList API error: ${response.statusText}`);
		}

		const data = await response.json();
		if (data.errors) {
			console.error("GraphQL errors:", data.errors);
			throw new Error(`GraphQL error: ${data.errors[0].message}`);
		}
		return NextResponse.json({
			results: data?.data?.Page?.media || [],
			pageInfo: data?.data?.Page?.pageInfo || {},
		});
	} catch (error) {
		console.error("Error fetching trending manga:", error);
		return NextResponse.json(
			{ error: "Failed to fetch trending manga" },
			{ status: 500 },
		);
	}
}
