"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 60,
			cacheTime: 1000 * 60 * 60 * 24,
		},
	},
});

export default function ReactQueryProvider({
	children,
}: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{/* <ReactQueryDevtools initialIsOpen={false} /> */}
		</QueryClientProvider>
	);
}
