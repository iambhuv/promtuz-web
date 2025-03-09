/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    API_ENDPOINT: 'https://827b-103-66-8-174.ngrok-free.app',
    CHAT_MESSAGES_LIMIT: "50",
    LOAD_MORE_THRESHOLD: "15"
  }
};

export default nextConfig;
