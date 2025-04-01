"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Login() {
	const [isLoading, setIsLoading] = useState(false);

	const handleAniListLogin = async () => {
		setIsLoading(true);
		await signIn("anilist", { callbackUrl: "/" });
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-6">
			<div className="w-full max-w-md rounded-lg border border-gray-200 p-8 shadow-md">
				<h1 className="mb-6 text-center font-bold text-2xl">
					Welcome to Dokusho
				</h1>
				<button
					onClick={handleAniListLogin}
					disabled={isLoading}
					className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
				>
					{isLoading ? "Logging in..." : "Login with AniList"}
				</button>
			</div>
		</div>
	);
}
