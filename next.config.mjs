/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_CHAT_MESSAGES_LIMIT: "50",
    NEXT_PUBLIC_LOAD_MORE_THRESHOLD: "15"
  },
  
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
