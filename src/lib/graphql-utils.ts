export const generateMutationAndVariables = (fields: Record<string, any>) => {
	const mutationFields: string[] = [];
	const variables: Record<string, any> = {};

	const fieldMapping: Record<string, string> = {
		startDate: "startedAt",
		endDate: "completedAt",
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
};

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
