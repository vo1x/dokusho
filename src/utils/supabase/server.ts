import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { cookies } from "next/headers";

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				async getAll() {
					const cookieStoreResolved = await cookieStore;
					return cookieStoreResolved.getAll();
				},
				async setAll(cookiesToSet) {
					try {
						const cookieStoreResolved = await cookieStore;
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStoreResolved.set(name, value, options),
						);
					} catch {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
					}
				},
			},
		},
	);
};
