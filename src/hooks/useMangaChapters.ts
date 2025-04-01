import { useQuery } from "@tanstack/react-query";

export function useMangaChapters(comicKId: string) {
	return useQuery({
		queryKey: ["comicKId", "chapters", comicKId],
		queryFn: async () => {
			const response = await fetch(
				`/api/comick/comic/chapters?mangaId=${comicKId}`,
			);
			if (!response.ok) {
				throw new Error("Failed to fetch chapters");
			}

			const data = await response.json();
			return data.chapters;
		},
		enabled: !!comicKId,
	});
}
