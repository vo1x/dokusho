import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAnilistData(anilistId: string) {
	return useQuery({
		queryKey: ["anilist", anilistId],
		queryFn: async () => {
			if (!anilistId) return null;

			const response = await fetch(
				`/api/anilist/get-entry?mediaId=${anilistId}`,
			);
			if (!response.ok) {
				throw new Error("Failed to fetch entry info");
			}

			const data = await response.json();
			return data;
		},
		enabled: !!anilistId,
	});
}

export function useUpdateMangaList() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			anilistId,
			status,
			progress,
			progressVolumes,
			score,
			startDate,
			endDate,
			notes,
		}: {
			anilistId: string;
			progress: number;
			status?: string;
			progressVolumes?: string;
			score?: number;
			startDate?: any;
			endDate?: any;
			notes?: string;
		}) => {
			const response = await fetch("/api/anilist/update-list", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					mediaId: anilistId,
					status,
					progress,
					progressVolumes,
					score,
					startDate,
					endDate,
					notes,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update list");
			}
			const data = await response.json();
			return data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries(["anilist", variables.anilistId]);
		},
	});
}
