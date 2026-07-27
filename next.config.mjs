/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/explore/archive",
        destination: "/library",
        permanent: true,
      },
      {
        source: "/read",
        destination: "/library",
        permanent: true,
      },
      {
        source: "/works/:slug",
        destination: "/library/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
