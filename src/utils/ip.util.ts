/**
 * Extracts the client IP address from request headers or socket.
 * - Prefers the first IP from "x-forwarded-for"
 * - Falls back to req.socket.remoteAddress
 * - Normalizes IPv6 mapped IPv4 (::ffff:127.0.0.1 → 127.0.0.1)
 */
export function getClientIp(req: any): string {
  const xForwardedFor = req.headers["x-forwarded-for"];
  let ip = "";

  if (xForwardedFor) {
    const ips = (xForwardedFor as string).split(",").map((ip) => ip.trim());
    ip = ips[0]; // first IP is usually the real client
  } else {
    ip = req.socket?.remoteAddress || "";
  }

  // Normalize IPv6 mapped IPv4 addresses
  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  return ip;
}
