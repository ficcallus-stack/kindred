/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/apply",
        destination: "/register/nanny",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
