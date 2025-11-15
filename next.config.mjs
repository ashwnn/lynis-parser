/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Output as a static export so `next export` (or `next build` with `output: 'export'`) produces ./out for GitHub Pages
  output: 'export'
};

export default nextConfig;
