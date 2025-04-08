import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query");
  
  if (!query) {
    return NextResponse.json({ error: "Query parameter required" }, { status: 400 });
  }

  try {
    const graphqlQuery = `
      query {
        Media(type: MANGA, search: "${query.replace(/"/g, '\\"')}") {
          id
          idMal
          title {
            romaji
            english
            native
          }
          coverImage {
            large
          }
          siteUrl
          status
          chapters
        }
      }
    `;

    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ query: graphqlQuery })
    });

    const data = await response.json();
    return NextResponse.json(data?.data?.Media || null);
  } catch (error) {
    console.error("Error searching AniList:", error);
    return NextResponse.json({ error: "Failed to search AniList" }, { status: 500 });
  }
}