"use client";

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function Trending() {
	const { data: trending, isLoading } = useQuery({
		queryKey: ["trending"],
		queryFn: async () => {
			const url = "/api/comick/trending";
			const data = await fetch(url);
			return data.json();
		},
	});

	return isLoading ? (
		<div>loading yoo..</div>
	) : (
		<div className="w-full max-w-6xl mb-10 relative">
			<Carousel
				opts={{
					align: "start",
					loop: true,
				}}
				className="w-full"
			>
				<CarouselContent className="-ml-4">
					{trending.map((manga, index) => (
						<CarouselItem
							key={index}
							className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
						>
							<Link
								href={`/manga/${manga.slug}`}
								className="block relative h-[300px] overflow-hidden rounded-md"
							>
								<img
									src={manga.cover.url}
									alt={manga.title}
									className="w-full h-full object-cover object-top"
								/>
								<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent flex flex-col justify-end p-4">
									<h3 className="text-white font-bold text-2xl line-clamp-2 mb-4">
										{manga.title}
									</h3>
								</div>
							</Link>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious className="right-0 top-0 mr-14 mt-8 h-8 w-8 rounded-md bg-dokusho-button-primary border-0 shadow-xs shadow-black/50" />
				<CarouselNext className="right-0 top-0 mt-8 mr-4 h-8 w-8 rounded-md border-0 bg-dokusho-button-primary shadow-xs shadow-black/50" />
			</Carousel>
		</div>
	);
}
