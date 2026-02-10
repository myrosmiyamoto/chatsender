import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/chatsender",
  // 複数ロックファイル検出時の警告を解消し、このプロジェクトをビルドのルートにする
  outputFileTracingRoot: path.join(__dirname),
  // 開発時: ネットワークIP(192.168.56.1)やVM等からのアクセスを許可
  allowedDevOrigins: ["http://192.168.56.1:3000"],
};

export default nextConfig;
