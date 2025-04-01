"use client"

import Navigation from "@/components/nav";

import { useSession } from "next-auth/react";


export default function Home() {

  const session = useSession();

  return (
    <main className="flex min-h-screen flex-col">
      <Navigation />
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <h1 className="mb-6 text-4xl font-bold">Dokusho</h1>
        <p className="text-center text-lg">
          Comic reader.


          {JSON.stringify(session?.data?.user,null,2)}
        </p>
      </div>
    </main>
  );
}