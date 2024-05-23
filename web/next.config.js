const analyze = require("@next/bundle-analyzer");

const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "export",
  images: {
    unoptimized: true,
  },
};

const withBundleAnalyzer = analyze({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(config);
