/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/chat': ['./knowledge/**/*'],
  },
};

export default nextConfig;
