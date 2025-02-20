// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   publicRuntimeConfig: {
//     env: process.env.ENV, // Keep your current public runtime environment variable
//   },
//   trailingSlash: false, // Ensures proper routing without trailing slashes
//   reactStrictMode: true, // Enables React strict mode for better debugging
//   experimental: {
//     appDir: true, // Ensures compatibility with Next.js 13+ app directory features
//   },
//   images: {
//     unoptimized: true, // Disable image optimization (Netlify handles it via Edge Functions)
//   },
//   webpack: (config) => {
//     return config;
//   },
// };

// module.exports = nextConfig;