import { useInfiniteQuery } from "@tanstack/react-query";

export function useInfiniteMangaUpdates() {
	return useInfiniteQuery({
		queryKey: ["infiniteMangaUpdates"],
		queryFn: async ({ pageParam = 1 }) => {
			const response = await fetch(`/api/comick/updates?page=${pageParam}`);
			if (!response.ok) {
				throw new Error("Error fetching manga updates");
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
