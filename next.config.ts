import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images:{
      remotePatterns:[
       
        {
          protocol: "https",
          hostname: "utfs.io",
        },
      ],
    },
    productionBrowserSourceMaps: true,
  
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
