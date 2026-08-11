import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 구글 로그인 사용자의 프로필 사진 (lh3.googleusercontent.com 등)
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      // Supabase Storage 공개 버킷 (profile-image 등)
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
