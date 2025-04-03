import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "s4.anilist.co",
				port: "",
				pathname: "/file/anilistcdn/**",
			},
			{
				protocol: "https",
				hostname: "**.comick.fun",
			},
			{
				protocol: "https",
				hostname: "meo.comick.pictures",
			},
		],
	},
};

export default nextConfig;
