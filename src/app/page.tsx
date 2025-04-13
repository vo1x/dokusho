import Trending from "@/components/trending-carousel";
import InfiniteMangaGrid from "@/components/manga-grid";

export default async function Home() {
	return (
		<div className="flex flex-1 flex-col p-6">
			<Trending />
			<section>
				<h1 className="text-xl font-semibold text-dokusho-subtle">UPDATES</h1>
			</section>
			<InfiniteMangaGrid />
		</div>)}