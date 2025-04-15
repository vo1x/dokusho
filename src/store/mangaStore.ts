import { create } from "zustand";

interface Chapter {
	chId: string;
	chNum: number;
	title: string;
	groupName: string;
	createdAt: string;
}

interface MangaMetadata {
	id: string;
	title: string;
	coverUrl?: string;
	description?: string;
	author?: string;
	artist?: string;
	genres?: string[];
}

interface MangaState {
	metadata: MangaMetadata | null;
	chapters: Chapter[];
	setMetadata: (metadata: MangaMetadata) => void;
	setChapters: (chapters: Chapter[]) => void;
	clear: () => void;
	getNextChapter: (currentChId: string) => Chapter | undefined;
	getPrevChapter: (currentChId: string) => Chapter | undefined;
}

export const useMangaStore = create<MangaState>((set, get) => ({
	metadata: null,
	chapters: [],
	setMetadata: (metadata) => set({ metadata }),
	setChapters: (chapters) => set({ chapters }),
	clear: () => set({ metadata: null, chapters: [] }),
	getNextChapter: (currentChId) => {
		const chapters = get().chapters;
		const sorted = [...chapters].sort((a, b) => a.chNum - b.chNum);
		const idx = sorted.findIndex((ch) => ch.chId === currentChId);
		return idx !== -1 && idx < sorted.length - 1 ? sorted[idx + 1] : undefined;
	},
	getPrevChapter: (currentChId) => {
		const chapters = get().chapters;
		const sorted = [...chapters].sort((a, b) => a.chNum - b.chNum);
		const idx = sorted.findIndex((ch) => ch.chId === currentChId);
		return idx > 0 ? sorted[idx - 1] : undefined;
	},
}));
