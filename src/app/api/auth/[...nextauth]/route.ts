import NextAuth, { type NextAuthOptions } from "next-auth";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getFreshAccessToken } from "@/lib/refresh-token";
export const authOptions: NextAuthOptions = {
	providers: [
		{
			id: "anilist",
			name: "AniList",
			type: "oauth",
			authorization: {
				url: "https://anilist.co/api/v2/oauth/authorize",
				params: { scope: "" },
			},
			token: "https://anilist.co/api/v2/oauth/token",
			userinfo: {
				url: "https://graphql.anilist.co",
				async request({ tokens, provider }) {
					const query = `
            query {
              Viewer {
                id
                name
                avatar {
                  large
                }
              }
            }
          `;

					const response = await fetch("https://graphql.anilist.co", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${tokens.access_token}`,
						},
						body: JSON.stringify({ query }),
					});

					const { data } = await response.json();

					if (data?.Viewer) {
						return {
							id: data.Viewer.id.toString(),
							name: data.Viewer.name,
							image: data.Viewer.avatar?.large,
						};
					}

					throw new Error("Failed to fetch user information from AniList");
				},
			},
			clientId: process.env.ANILIST_CLIENT_ID as string,
			clientSecret: process.env.ANILIST_CLIENT_SECRET as string,
			profile(profile) {
				return {
					id: profile.id,
					name: profile.name,
					image: profile.image,
				};
			},
		},
	],
	callbacks: {
		async jwt({ token, user, account }) {
			if (account && user) {
				token.accessToken = account.access_token;
				token.refreshToken = account.refresh_token;
				token.provider = account.provider;
				token.userId = user.id || account.providerAccountId;

				let expiryTime: number;

				if (account.expires_in) {
					expiryTime =
						Math.floor(Date.now() / 1000) + (account.expires_in as number);
					console.log(
						`Token will expire in ${account.expires_in} seconds (${(account.expires_in as number) / 86400} days)`,
					);
				} else if (account.expires_at) {
					expiryTime = account.expires_at;
				} else {
					expiryTime = Math.floor(Date.now() / 1000) + 31536000;
					console.log("No expiry provided, defaulting to 1 year");
				}

				token.expires_at = expiryTime;
				console.log(
					"Token will expire at:",
					new Date(expiryTime * 1000).toISOString(),
				);
				try {
					const cookieStore = cookies();
					const supabase = createClient(cookieStore);

					const { data: existingUser, error: selectError } = await supabase
						.from("user_auth")
						.select("*")
						.eq("user_id", token.userId)
						.maybeSingle();

					if (selectError) {
						console.error("Error checking for existing user:", selectError);
					}

					if (existingUser) {
						const { error: updateError } = await supabase
							.from("user_auth")
							.update({
								access_token: account.access_token,
								refresh_token: account.refresh_token,
								provider: account.provider,
								provider_account_id: account.providerAccountId,
								expires_at: token.expires_at,
								updated_at: new Date().toISOString(),
							})
							.eq("user_id", token.userId);

						if (updateError) {
							console.error("Error updating user tokens:", updateError);
						} else {
							console.log(
								"Updated tokens in Supabase with expiry at:",
								new Date(token.expires_at * 1000).toISOString(),
							);
						}
					} else {
						const { error: insertError } = await supabase
							.from("user_auth")
							.insert({
								user_id: token.userId,
								access_token: account.access_token,
								refresh_token: account.refresh_token,
								provider: account.provider,
								provider_account_id: account.providerAccountId,
								expires_at: token.expires_at,
								created_at: new Date().toISOString(),
								updated_at: new Date().toISOString(),
							});

						if (insertError) {
							console.error("Error inserting user tokens:", insertError);
						} else {
							console.log(
								"Inserted tokens in Supabase with expiry at:",
								new Date(token.expires_at * 1000).toISOString(),
							);
						}
					}
				} catch (error) {
					console.error("Error storing tokens in Supabase:", error);
				}
			}

			if (token.expires_at && token.userId) {
				const currentTime = Math.floor(Date.now() / 1000);
				const shouldRefreshTime = token.expires_at - 5;

				if (currentTime > shouldRefreshTime) {
					console.log(
						"Token expired, attempting refresh using getFreshAccessToken...",
					);
					try {
						const freshAccessToken = await getFreshAccessToken(
							token.userId as string,
						);

						if (!freshAccessToken) {
							throw new Error("Failed to refresh access token");
						}

						console.log("Token refreshed successfully");

						token.accessToken = freshAccessToken;

						const newExpiryTime = Math.floor(Date.now() / 1000) + 30; // Another 30 seconds for testing
						token.expires_at = newExpiryTime;

						// Update expires_at in database
						const cookieStore = cookies();
						const supabase = createClient(cookieStore);
						const { error: updateError } = await supabase
							.from("user_auth")
							.update({
								access_token: freshAccessToken,
								expires_at: newExpiryTime,
								updated_at: new Date().toISOString(),
							})
							.eq("user_id", token.userId);

						if (updateError) {
							console.error("Error updating token expiry:", updateError);
						}
					} catch (error) {
						console.error("Error refreshing token:", error);
						return { ...token, error: "RefreshAccessTokenError" };
					}
				}
			}

			return token;
		},

		async session({ session, token }) {
			session.accessToken = token.accessToken as string;
			session.error = token.error as string;
			session.user.id = token.userId as string;
			return session;
		},
	},
	pages: {
		signIn: "/login",
		error: "/auth/error",
	},
	debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
