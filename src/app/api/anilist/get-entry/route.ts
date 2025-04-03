import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import type { IMangaResponse } from "@/types/types";

export async function GET(request: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session || !session.accessToken) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const mediaId = request.nextUrl.searchParams.get("mediaId");

	if (!mediaId) {
		return NextResponse.json(
			{ error: "Media ID is required" },
			{ status: 400 },
		);
	}

	const query = `
    query ($mediaId: Int!) {
      Media(id: $mediaId) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          medium
          color
        }
		bannerImage
        mediaListEntry {
          id
          status
          progress
          progressVolumes
          score
          startedAt {
            year
            month
            day
          }
          completedAt {
            year
            month
            day
          }
          notes
        }
      }
    }
  `;

	const variables = { mediaId: Number.parseInt(mediaId, 10) };

	try {
		const response = await fetch("https://graphql.anilist.co", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.accessToken}`,
			},
			body: JSON.stringify({ query, variables }),
		});

		if (!response.ok) {
			const error = await response.json();
			console.error("AniList API error:", error);
			return NextResponse.json(
				{ error: "Failed to fetch media list entry" },
				{ status: 500 },
			);
		}

		const data = await response.json();
		const mangaData = data.data.Media as IMangaResponse;
		return NextResponse.json(mangaData, { status: 200 });
	} catch (error) {
		console.error("Error fetching media list entry:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
