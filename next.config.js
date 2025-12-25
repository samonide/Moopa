/** @type {import('next').NextConfig} */
// const nextSafe = require("next-safe");

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

module.exports = withPWA({
  reactStrictMode: true,
  webpack(config, options) {
    config.resolve.extensions.push(".ts", ".tsx");
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // distDir: process.env.BUILD_DIR || ".next",
  // Uncomment this if you want to use Docker
  // output: "standalone",
  async redirects() {
    return [
      {
        source: "/github",
        destination: "https://github.com/samonide/moopa",
        permanent: false,
        basePath: false,
      },
      {
        source: "/changelogs",
        destination: "https://github.com/Ani-Moopa/Moopa/releases",
        permanent: false,
        basePath: false,
      },
      {
        source: "/github",
        destination: "https://github.com/Ani-Moopa/Moopa",
        permanent: false,
        basePath: false,
      },
      {
        source: "/discord",
        destination: "https://discord.gg/v5fjSdKwr2",
        permanent: false,
        basePath: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path(favicon.*|icon.*|manifest.json)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
  // async headers() {
  //   return [
  //     {
  //       // matching all API routes
  //       source: "/api/:path*",
  //       headers: [
  //         { key: "Access-Control-Allow-Credentials", value: "true" },
  //         {
  //           key: "Access-Control-Allow-Origin",
  //           value: "https://moopa.live",
  //         }, // replace this your actual origin
  //         {
  //           key: "Access-Control-Allow-Methods",
  //           value: "GET,DELETE,PATCH,POST,PUT",
  //         },
  //         {
  //           key: "Access-Control-Allow-Headers",
  //           value:
  //             "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  //         },
  //       ],
  //     },
  //     {
  //       source: "/:path*",
  //       headers: nextSafe({
  //     contentTypeOptions: "nosniff",
  //     contentSecurityPolicy: {
  //       "base-uri": "'none'",
  //       "child-src": "'none'",
  //       "connect-src": [
  //         "'self'",
  //         "webpack://*",
  //         "https://graphql.anilist.co/",
  //         "https://api.aniskip.com/",
  //         "https://m3u8proxy.moopa.workers.dev/",
  //       ],
  //       "default-src": "'self'",
  //       "font-src": [
  //         "'self'",
  //         "https://cdnjs.cloudflare.com/",
  //         "https://fonts.gstatic.com/",
  //       ],
  //       "form-action": "'self'",
  //       "frame-ancestors": "'none'",
  //       "frame-src": "'none'",
  //       "img-src": [
  //         "'self'",
  //         "https://s4.anilist.co",
  //         "data:",
  //         "https://media.kitsu.io",
  //         "https://artworks.thetvdb.com",
  //         "https://img.moopa.live",
  //         "https://meo.comick.pictures",
  //         "https://kitsu-production-media.s3.us-west-002.backblazeb2.com",
  //       ],
  //       "manifest-src": "'self'",
  //       "media-src": ["'self'", "blob:"],
  //       "object-src": "'none'",
  //       "prefetch-src": false,
  //       "script-src": [
  //         "'self'",
  //         "https://static.cloudflareinsights.com",
  //         "'unsafe-inline'",
  //         "'unsafe-eval'",
  //       ],

  //       "style-src": [
  //         "'self'",
  //         "'unsafe-inline'",
  //         "https://cdnjs.cloudflare.com",
  //         "https://fonts.googleapis.com",
  //       ],
  //       "worker-src": "'self'",
  //       mergeDefaultDirectives: false,
  //       reportOnly: false,
  //     },
  //     frameOptions: "DENY",
  //     permissionsPolicy: false,
  //     // permissionsPolicyDirectiveSupport: ["proposed", "standard"],
  //     isDev: false,
  //     referrerPolicy: "no-referrer",
  //     xssProtection: "1; mode=block",
  //   }),
  // },
  //   ];
  // },
});
