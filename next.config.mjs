/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    API_ENDPOINT: 'http://localhost:8888',
    CHAT_MESSAGES_LIMIT: "50",
    LOAD_MORE_THRESHOLD: "15"
  }
};

export default nextConfig;
