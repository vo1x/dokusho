export type MangaStatus =
	| "CURRENT"
	| "COMPLETED"
	| "PLANNING"
	| "PAUSED"
	| "DROPPED";

export interface IDate {
	year: number | null;
	month: number | null;
	day: number | null;
}

export interface IMangaListEntry {
	id: number;
	status: MangaStatus;
	progress: number | null;
	progressVolumes: number | null;
	score: number | null;
	startedAt: IDate | null;
	completedAt: IDate | null;
	notes: string | null;
}

export interface ITitle {
	romaji: string;
	english: string | null;
	native: string | null;
}

export interface ICoverImage {
	extraLarge: string | null;
	large: string | null;
	medium: string | null;
	color: string | null;
}

export interface IMangaResponse {
	id: number;
	title: ITitle;
	coverImage: ICoverImage;
	bannerImage: string | null;
	mediaListEntry: IMangaListEntry | null;
}
