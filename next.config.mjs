const isProd = process.env.NODE_ENV === 'production';
const internalHost = process.env.TAURI_DEV_HOST || 'localhost';


/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { 'unoptimized': true },
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_CHAT_MESSAGES_LIMIT: "50",
    NEXT_PUBLIC_LOAD_MORE_THRESHOLD: "15",
    NEXT_PUBLIC_VAPID_PUB_KEY: "BFz61K63aWlQ11SSdnJVfgjtIxB0u9DGHKGatpc6uLYXa00s7Qa68yU69jma1XBxLaUn8GLJH7KXXpNaJULC9aM"
  },
  typescript: {
    ignoreBuildErrors: true
  },
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,
};

export default nextConfig;
