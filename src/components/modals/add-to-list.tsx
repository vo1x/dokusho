"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { toast } from "sonner";
import { useUpdateMangaList } from "@/hooks/useAnilistData";

export const AddToListModal = ({
	trackerInfo,
	isOpen,
	onClose = () => {},
}: {
	trackerInfo: any;
	isOpen: boolean;
	onClose: () => void;
}) => {
	useEffect(() => {
		if (isOpen) document.body.classList.add("overflow-y-hidden");

		return () => {
			document.body.classList.remove("overflow-y-hidden");
		};
	}, [isOpen]);

	const [status, setStatus] = useState(
		trackerInfo?.mediaListEntry?.status || "CURRENT",
	);

	const [progress, setProgress] = useState(
		trackerInfo?.mediaListEntry?.progress || 0,
	);
	const [score, setScore] = useState(trackerInfo?.mediaListEntry?.score || 0);

	const [startDate, setStartDate] = useState({
		year: trackerInfo?.mediaListEntry?.startedAt?.year || null,
		month: trackerInfo?.mediaListEntry?.startedAt?.month || null,
		day: trackerInfo?.mediaListEntry?.startedAt?.day || null,
	});

	const [endDate, setEndDate] = useState({
		year: trackerInfo?.mediaListEntry?.completedAt?.year || null,
		month: trackerInfo?.mediaListEntry?.completedAt?.month || null,
		day: trackerInfo?.mediaListEntry?.completedAt?.day || null,
	});

	const [notes, setNotes] = useState(trackerInfo?.mediaListEntry?.notes || "");

	const updateMutation = useUpdateMangaList();

	const isMutating = updateMutation.status === "pending";

	const handleSubmit = async () => {
		try {
			await updateMutation.mutateAsync({
				anilistId: trackerInfo?.id,
				progress,
				status,
				score,
				startDate,
				endDate,
				notes,
			});
			toast.success("Manga list updated");
		} catch (error) {
			toast.error("Error updating progress: ", error);
			console.error("Error updating progress: ", error);
		}
	};

	if (!trackerInfo) return <p>Loading entry info...</p>;

	return (
		<div className="fixed inset-0 z-50 flex h-full items-center bg-black/60 p-4 backdrop-blur-lg">
			<div className="mx-auto h-[75vh] w-full max-w-md overflow-y-auto rounded-md border border-dokusho-highlight-low bg-dokusho-base">
				<div className="relative h-32">
					<img
						src={trackerInfo?.bannerImage || trackerInfo?.coverImage?.large}
						alt=""
						className="h-full w-full object-cover shadow-black shadow-md"
					/>
					<button
						onClick={onClose}
						className="absolute top-2 right-2 rounded-full bg-black/40 p-1 transition-colors hover:bg-black/60"
					>
						<X className="h-5 w-5 text-white" />
					</button>
				</div>

				<div className="p-6">
					<h2 className="mb-4 font-semibold text-dokusho-subtle text-xl">
						{trackerInfo?.title?.english || trackerInfo?.title?.romaji}
					</h2>

					<form
						onSubmit={(e) => e.preventDefault()}
						className="flex flex-col gap-4"
					>
						<label className="flex flex-col gap-1 text-[#9ca3af]">
							Status:
							<select
								value={status}
								onChange={(e) => setStatus(e.target.value)}
								className="rounded-md border border-dokusho-highlight-low bg-dokusho-surface/50 p-2 text-white outline-none"
							>
								<option value="PLANNING">Planning</option>
								<option value="CURRENT">Reading</option>
								<option value="COMPLETED">Completed</option>
								<option value="PAUSED">Paused</option>
								<option value="DROPPED">Dropped</option>
							</select>
						</label>

						<div className="grid grid-cols-2 gap-4">
							<label className="flex flex-col gap-1 text-[#9ca3af]">
								Progress:
								<input
									type="number"
									className="rounded-md border border-dokusho-highlight-low bg-dokusho-surface/50 p-2 text-white outline-none"
									value={progress}
									onChange={(e) => setProgress(Number(e.target.value))}
									min="0"
								/>
							</label>

							<label className="flex flex-col gap-1 text-[#9ca3af]">
								Score:
								<input
									type="number"
									className="rounded-md border border-dokusho-highlight-low bg-dokusho-surface/50 p-2 text-white outline-none"
									value={score}
									onChange={(e) => setScore(Number(e.target.value))}
									min="0"
									max="10"
									step="0.5"
								/>
							</label>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<label className="flex flex-col gap-1 text-[#9ca3af]">
								Start Date:
								<input
									type="date"
									className="rounded-md border border-dokusho-highlight-low bg-dokusho-surface/50 p-2 text-white outline-none"
									value={
										startDate.year
											? `${startDate.year}-${String(startDate.month).padStart(2, "0")}-${String(
													startDate.day,
												).padStart(2, "0")}`
											: ""
									}
									onChange={(e) => {
										if (!e.target.value) {
											setStartDate({ year: null, month: null, day: null });
											return;
										}
										const [year, month, day] = e.target.value.split("-");
										setStartDate({
											year: Number(year),
											month: Number(month),
											day: Number(day),
										});
									}}
								/>
							</label>

							<label className="flex flex-col gap-1 text-[#9ca3af]">
								End Date:
								<input
									type="date"
									className="rounded-md border border-dokusho-highlight-low bg-dokusho-surface/50 p-2 text-white outline-none"
									value={
										endDate.year
											? `${endDate.year}-${String(endDate.month).padStart(2, "0")}-${String(
													endDate.day,
												).padStart(2, "0")}`
											: ""
									}
									onChange={(e) => {
										if (!e.target.value) {
											setEndDate({ year: null, month: null, day: null });
											return;
										}
										const [year, month, day] = e.target.value.split("-");
										setEndDate({
											year: Number(year),
											month: Number(month),
											day: Number(day),
										});
									}}
								/>
							</label>
						</div>

						<label className="flex flex-col gap-1 text-[#9ca3af]">
							Notes:
							<textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								className="min-h-[100px] resize-none rounded-md border border-dokusho-highlight-low bg-dokusho-surface/50 p-2 text-white outline-none"
							/>
						</label>

						<div className="mt-2 flex justify-end gap-3">
							<button
								type="button"
								onClick={onClose}
								className="rounded-md border border-dokusho-highlight-low px-4 py-2 text-[#9ca3af] transition-colors hover:bg-dokusho-surface/70"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleSubmit}
								disabled={isMutating}
								className="rounded-md bg-dokusho-highlight-high px-4 py-2 text-white transition-colors hover:bg-dokusho-highlight-high/90 disabled:opacity-70"
							>
								{isMutating
									? "Saving..."
									: trackerInfo?.mediaListEntry
										? "Update"
										: "Add to List"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};
