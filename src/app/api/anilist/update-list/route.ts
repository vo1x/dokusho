import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function generateMutationAndVariables(fields: Record<string, any>) {
  const mutationFields: string[] = [];
  const variables: Record<string, any> = {};
  
  const fieldMapping: Record<string, string> = {
    startDate: "startedAt",
    endDate: "completedAt"
  };

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) {
      const anilistFieldName = fieldMapping[key] || key;
      
      mutationFields.push(`${anilistFieldName}: $${key}`);
      variables[key] = value;
    }
  }

  const mutation = `
    mutation (${Object.keys(variables)
      .map((key) => `$${key}: ${getGraphQLType(key)}`)
      .join(", ")}) {
      SaveMediaListEntry(
        ${mutationFields.join(", ")}
      ) {
        id
        mediaId
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
  `;

  return { mutation, variables };
}

function getGraphQLType(fieldName: string): string {
  const typeMap: Record<string, string> = {
    mediaId: "Int!",
    status: "MediaListStatus",
    progress: "Int",
    progressVolumes: "Int",
    score: "Float",
    startDate: "FuzzyDateInput",
    endDate: "FuzzyDateInput",
    notes: "String",
  };

  return typeMap[fieldName] || "String";
}

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
        { status: 400 }
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