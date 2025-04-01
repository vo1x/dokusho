"use client";

import { useState } from "react";

import { useEffect } from "react";

export default function Reader({ params }: { params: { params: string[] } }) {
	const mangaSlug = params.params[0];
	const chapterSlug = params.params[1];

	return (
		<div>
			{mangaSlug}
			{chapterSlug}
			{pages.length > 0 ? (
				pages.map((page) => <div>{page.url}</div>)
			) : (
				<div>nothing to shoe</div>
			)}
		</div>
	);
}
