/** @type {import('next').NextConfig} */

// Baseline hardening applied to every route. None of these affect whether a
// page can be iframed, so they are safe on the widget surfaces too.
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

// Anti-clickjacking. Applied everywhere EXCEPT the embeddable widget surfaces
// (/frame and /embed), which must be iframe-able on customer sites. /frame's
// own per-site frame-ancestors policy is set in middleware.
const antiFramingHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

const nextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/((?!frame|embed).*)", headers: antiFramingHeaders },
    ];
  },
};

module.exports = nextConfig;
