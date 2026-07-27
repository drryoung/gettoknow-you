/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/explore/archive",
        destination: "/read",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
