"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function Navigation() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  return (
    <nav className="border-b border-gray-200 bg-black p-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Dokusho
        </Link>
        <div>
          {loading ? (
            <span>Loading...</span>
          ) : session ? (
            <div className="flex items-center gap-4">
              <span>Hello, {session.user?.name || "User"}</span>
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <button
                onClick={() => signOut()}
                className="rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("anilist")}
              className="rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}