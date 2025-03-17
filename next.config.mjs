/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    CHAT_MESSAGES_LIMIT: "50",
    LOAD_MORE_THRESHOLD: "15"
  },
  
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
