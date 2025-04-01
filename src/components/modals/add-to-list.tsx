"use client";

import { useEffect, useState } from "react";

export const AddToListModal = ({ mediaId }: { mediaId: number }) => {
  const [status, setStatus] = useState("PLANNING");
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [startDate, setStartDate] = useState({
    year: null,
    month: null,
    day: null,
  });
  const [endDate, setEndDate] = useState({
    year: null,
    month: null,
    day: null,
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch existing entry info
  useEffect(() => {
    const fetchEntryInfo = async () => {
      setFetching(true);
      setError(null);

      try {
        const response = await fetch(`/api/anilist/get-entry?mediaId=${mediaId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch entry info");
        }

        const data = await response.json();
        const entry = data.mediaListEntry;

        if (entry) {
          setStatus(entry.status || "PLANNING");
          setProgress(entry.progress || 0);
          setScore(entry.score || 0);
          setStartDate(entry.startedAt || { year: null, month: null, day: null });
          setEndDate(entry.completedAt || { year: null, month: null, day: null });
          setNotes(entry.notes || "");
        }
      } catch (err: any) {
        console.error("Error fetching entry info:", err);
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };

    if (mediaId) {
      fetchEntryInfo();
    }
  }, [mediaId]);

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/anilist/update-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mediaId,
          status,
          progress,
          score,
          startDate,
          endDate,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update list");
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Error adding to list:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <p>Loading entry info...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div>
      <h2>Add to List</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Successfully added to list!</p>}
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          Status:
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="PLANNING">Planning</option>
            <option value="CURRENT">Reading</option>
            <option value="COMPLETED">Completed</option>
            <option value="PAUSED">Paused</option>
            <option value="DROPPED">Dropped</option>
          </select>
        </label>
        <label>
          Progress:
          <input
            type="number"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
          />
        </label>
        <label>
          Score:
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
          />
        </label>
        <label>
          Start Date:
          <input
            type="date"
            value={
              startDate.year
                ? `${startDate.year}-${String(startDate.month).padStart(2, "0")}-${String(
                    startDate.day
                  ).padStart(2, "0")}`
                : ""
            }
            onChange={(e) => {
              const [year, month, day] = e.target.value.split("-");
              setStartDate({
                year: Number(year),
                month: Number(month),
                day: Number(day),
              });
            }}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={
              endDate.year
                ? `${endDate.year}-${String(endDate.month).padStart(2, "0")}-${String(
                    endDate.day
                  ).padStart(2, "0")}`
                : ""
            }
            onChange={(e) => {
              const [year, month, day] = e.target.value.split("-");
              setEndDate({
                year: Number(year),
                month: Number(month),
                day: Number(day),
              });
            }}
          />
        </label>
        <label>
          Notes:
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-md border bg-neutral-800 p-2"
        >
          {loading ? "Adding..." : "Add to List"}
        </button>
      </form>
    </div>
  );
};