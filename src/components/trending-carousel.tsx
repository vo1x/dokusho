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
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MangaItem {
	id: string;
	title: string;
	coverImage: string;
}

interface TrendingManga {
	slug: string;
	title: string;
	cover: {
		url: string;
	};
}

export default function Trending() {
	const { data: trending, isLoading: trendingLoading } = useQuery<
		TrendingManga[]
	>({
		queryKey: ["trending"],
		queryFn: async () => {
			const url = "/api/comick/trending";
			const data = await fetch(url);
			return data.json();
		},
	});

	return (
		<>
			{trendingLoading ? (
				<div className="w-full mb-10">
					<Skeleton className="h-[300px] w-full" />
				</div>
			) : (
				<div className="w-full mb-10 relative">
					<Carousel
						opts={{
							align: "start",
							loop: true,
						}}
						className="w-full"
					>
						<CarouselContent className="-ml-4">
							{trending?.map((manga: TrendingManga, index: number) => (
								<CarouselItem
									key={manga.slug}
									className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
								>
									<Link
										href={`/manga/${manga.slug}`}
										className="group block relative h-[300px] overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-dokusho-button-primary/20"
									>
										<img
											src={manga.cover.url}
											alt={manga.title}
											className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
										/>
										<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col justify-end p-4 translate-y-0 transition-all duration-300">
											<h3 className="text-white font-semibold text-lg leading-tight line-clamp-2 mb-2 tracking-wide">
												{manga.title}
											</h3>
										</div>
									</Link>
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-dokusho-button-primary/90 hover:bg-dokusho-button-primary border-0 shadow-lg shadow-black/20 transition-all duration-200 hover:scale-110">
							<ChevronLeft className="h-6 w-6 text-white" />
						</CarouselPrevious>
						<CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-dokusho-button-primary/90 hover:bg-dokusho-button-primary border-0 shadow-lg shadow-black/20 transition-all duration-200 hover:scale-110">
							<ChevronRight className="h-6 w-6 text-white" />
						</CarouselNext>
					</Carousel>
				</div>
			)}
		</>
	);
}
