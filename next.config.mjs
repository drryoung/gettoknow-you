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
      // Theme slug changes: add a one-hop redirect here when a theme URL slug
      // is deliberately renamed. Title edits alone must not change the slug.
    ];
  },
};

export default nextConfig;
