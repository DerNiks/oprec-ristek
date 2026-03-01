import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    transpilePackages: [
        "swagger-ui-react",
        "react-syntax-highlighter",
        "swagger-client",
    ],
};

export default nextConfig;
