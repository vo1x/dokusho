import { useInfiniteQuery } from "@tanstack/react-query";

export interface MangaPageInfo {
	total: number;
	currentPage: number;
	lastPage: number;
	hasNextPage: boolean;
	perPage: number;
}

export interface MangaResponse {
	results: any[];
	pageInfo: MangaPageInfo;
}

export function useInfiniteTrendingManga(perPage = 20) {
	return useInfiniteQuery<MangaResponse>({
		queryKey: ["infiniteTrendingManga", perPage],
		queryFn: async ({ pageParam = 1 }) => {
			const response = await fetch(`/api/anilist/trending?page=${pageParam}`);
			if (!response.ok) {
				throw new Error("Error occurred");
			}

			return response.json();
		},

		getNextPageParam: (lastPage) => {
			if (lastPage?.pageInfo?.hasNextPage) {
				return lastPage.pageInfo.currentPage + 1;
			}

			return undefined;
		},
		initialPageParam: 1,
		staleTime: 5 * 60 * 1000,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
		retry: 2,
	});
}
