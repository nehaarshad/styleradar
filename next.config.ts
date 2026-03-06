
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

import { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig = {
  turbopack: {
    // ...
  },
  reactStrictMode: true,
 // swcMinify: true,
  // other Next.js configs
};

const pwdconfig = withPWA({
  dest: 'public',   // where service worker files will be generated
  register: true,   // auto-register service worker
  skipWaiting: true // activate new SW immediately
})

export default pwdconfig(nextConfig);