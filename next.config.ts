import type { NextConfig } from "next";

const nextConfig: NextConfig = {
// ...existing code...

images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 's4.anilist.co',
      port: '',
      pathname: '/file/anilistcdn/**',
    },
    // Add other domains as needed following the same pattern
  ],
},

// ...existing code...
};

export default nextConfig;
