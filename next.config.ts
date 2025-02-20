/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/user",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
