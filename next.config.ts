import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 純靜態輸出,部署到 GitHub Pages(一般 repo 子路徑)
  output: "export",
  basePath: "/personal-resume",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
