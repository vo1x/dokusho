"use client";

import { useInfiniteTrendingManga } from "@/hooks/useTrendingManga";
import { useInfiniteMangaUpdates } from "@/hooks/useMangaUpdates";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

import Link from "next/link";
import Image from "next/image";

export default function InfiniteMangaGrid() {
	const { ref, inView } = useInView({
		threshold: 0.1,
		triggerOnce: false,
	});

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		error,
	} = useInfiniteMangaUpdates();

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

	if (isLoading) return <LoadingSkeleton />;

	if (error) return <div>Error</div>;

	return (
		<div className="container mx-auto px-4">
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{data?.pages.map((page) =>
					page.data.map((manga) => (
						<MangaCard
							key={`${manga.manga.hid}-${manga.chNum}`}
							manga={manga}
						/>
					)),
				)}
			</div>

			<div ref={ref} className="mt-8 flex justify-center py-8">
				{isFetchingNextPage ? (
					<LoadingIndicator />
				) : hasNextPage ? (
					<div className="h-10 w-10"></div>
				) : (
					<p className="text-center text-dokusho-text-muted text-sm">
						No more manga to load
					</p>
				)}
			</div>
		</div>
	);
}

function MangaCard({ manga }) {
	const { manga: mangaData, chNum, chVol } = manga;
	const title = mangaData.title;

	return (
		<Link
			href={`/manga/${mangaData.hid}`}
			className="group hover:-translate-y-1 transition-transform"
		>
			<div className="overflow-hidden rounded-md bg-dokusho-bg-med shadow">
				<div className="relative aspect-[2/3] w-full">
					<Image
						src={mangaData.cover.url}
						alt={title}
						fill
						sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
						className="object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				</div>
				<div className="p-3">
					<h3
						className="line-clamp-2 font-medium text-dokusho-text text-sm"
						title={title}
					>
						{title}
					</h3>

					<div className="flex justify-between items-center mt-1">
						<span className="rounded-md bg-[#151f2e] p-1 px-2 font-semibold text-[#728AA1] text-xs">
							{mangaData.country}
						</span>

						{chNum && (
							<span className="text-xs text-dokusho-text-muted">
								Ch {chNum}
								{chVol ? ` Vol ${chVol}` : ""}
							</span>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}

function LoadingIndicator() {
	return (
		<div className="h-8 w-8 animate-spin rounded-full border-4 border-dokusho-highlight-low border-t-dokusho-primary"></div>
	);
}

function LoadingSkeleton() {
	return (
		<div className="container mx-auto px-4">
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{Array.from({ length: 18 }).map((_, index) => (
					<div key={index} className="animate-pulse">
						<div className="aspect-[2/3] w-full rounded-md bg-dokusho-highlight-low"></div>
						<div className="mt-2 h-4 w-3/4 rounded bg-dokusho-highlight-low"></div>
						{/* <div className="mt-1 h-3 w-1/2 rounded bg-dokusho-highlight-low"></div> */}
					</div>
				))}
			</div>
		</div>
	);
}
