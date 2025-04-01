import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const chapterId = request.nextUrl.searchParams.get("chapterId");
	
	if (!chapterId?.trim())
		return NextResponse.json(
			{ error: "Chapter ID is required" },
			{ status: 404 },
		);

	const url = `https://api.comick.fun/chapter/${chapterId}/get_images?tachiyomi=true`;

	try {
		const response = await fetch(url);
		const data = await response.json();
		const pages = data.map((image: any) => ({
			pgNum: image.b2key.split("-")[0],
			url: `https://meo.comick.pictures/${image.b2key}`,
			width: image.w,
			height: image.h,
			size: image.s,
		}));
		return NextResponse.json({ pages }, { status: 200 });
	} catch (error) {
		console.error("Error getting pages: ", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
