import Trending from "@/components/trending-carousel";
import InfiniteMangaGrid from "@/components/manga-grid";

export default async function Home() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center p-6">
			<Trending />
			<InfiniteMangaGrid />
		</div>
	);
}
