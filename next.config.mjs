/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    API_ENDPOINT: 'https://api.scsservice.cloud',
    CHAT_MESSAGES_LIMIT: "50",
    LOAD_MORE_THRESHOLD: "15"
  }
};

export default nextConfig;
