import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { generateMutationAndVariables } from "@/lib/graphql-utils";

export async function POST(request: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session || !session.accessToken) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const {
			mediaId,
			status,
			progress,
			progressVolumes,
			score,
			startDate,
			endDate,
			notes,
		} = await request.json();

		if (!mediaId) {
			return NextResponse.json(
				{ error: "Media ID is required" },
				{ status: 400 },
			);
		}

		const { mutation, variables } = generateMutationAndVariables({
			mediaId,
			status,
			progress,
			progressVolumes,
			score,
			startDate,
			endDate,
			notes,
		});

		const response = await fetch("https://graphql.anilist.co", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.accessToken}`,
			},
			body: JSON.stringify({ query: mutation, variables }),
		});

		if (!response.ok) {
			const error = await response.json();
			console.error("AniList API error:", error);
			return NextResponse.json(
				{ error: "Failed to update manga list" },
				{ status: 500 },
			);
		}

		const data = await response.json();

		if (data.errors) {
			console.error("GraphQL errors:", data.errors);
			return NextResponse.json(
				{ error: data.errors[0].message },
				{ status: 400 },
			);
		}

		return NextResponse.json(data.data.SaveMediaListEntry, { status: 200 });
	} catch (error) {
		console.error("Error updating manga list:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
