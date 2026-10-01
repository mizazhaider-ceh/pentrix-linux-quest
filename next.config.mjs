/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // GitHub Pages serves this game from the /pentrix-linux-quest subpath,
  // while Vercel serves it from the domain root. Vercel's builders set
  // VERCEL=1, so the basePath switches automatically depending on where
  // it deploys.
  ...(process.env.VERCEL ? {} : { basePath: '/pentrix-linux-quest' }),
};

export default nextConfig;
