"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

/**
 * Renders the site footer only on non-admin routes.
 * Admin dashboard has its own layout and should not show the public footer.
 */
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  return <Footer />;
}
