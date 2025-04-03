import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";



export async function GET(request: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session || !session.accessToken) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!session.user?.id) {
		console.error("User ID is missing from session", session);
		return NextResponse.json({ error: "User ID not found" }, { status: 400 });
	}

	try {
		const query = `
      query {
        MediaListCollection(userId: ${session.user.id}, type: MANGA, sort: [UPDATED_TIME_DESC]) {
          lists {
            name
            status
            entries {
              id
              mediaId
              status
              score
              progress
              progressVolumes
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
              media {
                id
                title {
                  romaji
                  english
                  native
                }
                coverImage {
                  large
                  medium
                }
                description
                chapters
                volumes
                format
                status
                genres
                averageScore
                popularity
                startDate {
                  year
                  month
                  day
                }
              }
            }
          }
        }
      }
    `;

		const response = await fetch("https://graphql.anilist.co", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.accessToken}`,
			},
			body: JSON.stringify({ query }),
		});

		if (!response.ok) {
			const error = await response.json();
			console.error("AniList API error:", error);
			return NextResponse.json(
				{ error: "Failed to fetch manga list" },
				{ status: 500 },
			);
		}

		const data = await response.json();
		console.log(JSON.stringify(data.data.MediaListCollection, null, 2));
		return NextResponse.json(
			{ comics: data.data.MediaListCollection.lists },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching manga list:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
