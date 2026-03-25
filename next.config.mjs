/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/apply",
        destination: "/register/nanny",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.kindredcareus.com https://*.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.kindredcareus.com",
              "img-src 'self' data: blob: https://*.googleusercontent.com https://api.dicebear.com https://*.clerk.com https://*.kindredcareus.com https://*.stripe.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.clerk.com https://*.kindredcareus.com https://*.stripe.com wss://*.clerk.com wss://*.kindredcareus.com",
              "frame-src 'self' https://*.stripe.com https://*.clerk.com https://*.kindredcareus.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.clerk.com https://*.kindredcareus.com"
            ].join("; ")
          }
        ],
      },
    ];
  },
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
