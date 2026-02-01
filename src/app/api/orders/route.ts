import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies GET /api/orders to the backend (AWS or local orders server).
 * Avoids CORS by having the browser call same-origin /api/orders.
 */
function getBackendOrdersUrl(): string {
  const fullUrl = process.env.NEXT_PUBLIC_ORDERS_API_URL;
  if (fullUrl) {
    const base = fullUrl.replace(/\/api\/orders\/?$/, "") || "http://localhost:4000";
    return `${base.replace(/\/$/, "")}/api/orders/admin/all`;
  }
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  if (!base) return "";
  return `${base}/orders`;
}

export async function GET(request: NextRequest) {
  const backendUrl = getBackendOrdersUrl();
  if (!backendUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_BASE_URL is not set", orders: [] },
      { status: 502 }
    );
  }

  const auth = request.headers.get("authorization") || "";

  try {
    const res = await fetch(backendUrl, {
      method: "GET",
      headers: auth ? { Authorization: auth } : {},
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({ orders: [] }));
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || res.statusText, orders: [] },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/orders] proxy error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Backend unreachable",
        orders: [],
      },
      { status: 502 }
    );
  }
}
