/** @type {import('next').NextConfig} */
const REPO_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '/lynis-analyzer';

const nextConfig = {
  reactStrictMode: true,
  // Static export so `next build` produces ./out for GitHub Pages
  output: 'export',
  // Deploying to GitHub Pages under https://ashwnn.github.io/lynis-analyzer/
  basePath: REPO_BASE,
  assetPrefix: REPO_BASE,
  env: { NEXT_PUBLIC_BASE_PATH: REPO_BASE },
  // Keep paths folder-style to work well with GitHub Pages (index.html per folder)
  trailingSlash: true,
};

export default nextConfig;
