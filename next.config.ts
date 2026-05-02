import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const REPO_NAME = 'zodiac_signs';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? `/${REPO_NAME}` : '',
  assetPrefix: isProd ? `/${REPO_NAME}/` : '',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
