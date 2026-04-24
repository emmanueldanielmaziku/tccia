import { NextRequest, NextResponse } from "next/server";

type IpLookupResponse = {
  status?: string;
  success?: boolean;
  lat?: number | string | null;
  lon?: number | string | null;
  country_name?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  regionName?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  message?: string;
};

type CachedLocation = {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  expiresAt: number;
};

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const ipLocationCache = new Map<string, CachedLocation>();

type NormalizedLocation = {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  source: "ip-api.com" | "ipapi.co" | "ipwho.is";
};

const getClientIp = (request: NextRequest): string => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }

  return "";
};

const isPrivateOrLoopbackIp = (ip: string): boolean => {
  const value = ip.trim().toLowerCase();
  if (!value) return true;

  // IPv4 loopback/private ranges
  if (
    value === "127.0.0.1" ||
    value.startsWith("10.") ||
    value.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(value)
  ) {
    return true;
  }

  // IPv6 loopback/link-local/unique-local
  if (
    value === "::1" ||
    value.startsWith("fe80:") ||
    value.startsWith("fc") ||
    value.startsWith("fd")
  ) {
    return true;
  }

  return false;
};

const normalizeFromIpApi = (data: IpLookupResponse): NormalizedLocation | null => {
  if (data.status !== "success") {
    return null;
  }

  const latitude = Number(data.lat);
  const longitude = Number(data.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
    city: data.city ?? "",
    region: data.regionName ?? "",
    country: data.country ?? "",
    source: "ip-api.com",
  };
};

const normalizeFromIpApiCo = (data: IpLookupResponse): NormalizedLocation | null => {
  const latitude = Number(data.latitude);
  const longitude = Number(data.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
    city: data.city ?? "",
    region: data.region ?? "",
    country: data.country_name ?? "",
    source: "ipapi.co",
  };
};

const normalizeFromIpWhoIs = (data: IpLookupResponse): NormalizedLocation | null => {
  if (data.success === false) {
    return null;
  }

  const latitude = Number(data.latitude);
  const longitude = Number(data.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
    city: data.city ?? "",
    region: data.region ?? "",
    country: data.country ?? "",
    source: "ipwho.is",
  };
};

const fetchFromProvider = async (
  provider: "ip-api.com" | "ipapi.co" | "ipwho.is",
  clientIp: string
): Promise<NormalizedLocation | null> => {
  const lookupUrl =
    provider === "ip-api.com"
      ? clientIp
        ? `http://ip-api.com/json/${encodeURIComponent(clientIp)}?fields=status,message,country,regionName,city,lat,lon`
        : "http://ip-api.com/json/?fields=status,message,country,regionName,city,lat,lon"
      : provider === "ipapi.co"
      ? clientIp
        ? `https://ipapi.co/${encodeURIComponent(clientIp)}/json/`
        : "https://ipapi.co/json/"
      : clientIp
      ? `https://ipwho.is/${encodeURIComponent(clientIp)}`
      : "https://ipwho.is/";

  const response = await fetch(lookupUrl, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const data: IpLookupResponse = await response.json();
  if (provider === "ip-api.com") {
    return normalizeFromIpApi(data);
  }
  if (provider === "ipapi.co") {
    return normalizeFromIpApiCo(data);
  }
  return normalizeFromIpWhoIs(data);
};

export async function GET(request: NextRequest) {
  try {
    const detectedIp = getClientIp(request);
    const clientIp = isPrivateOrLoopbackIp(detectedIp) ? "" : detectedIp;
    const cacheKey = clientIp || "request-ip";
    const cached = ipLocationCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({
        success: true,
        data: {
          latitude: cached.latitude,
          longitude: cached.longitude,
          city: cached.city,
          region: cached.region,
          country: cached.country,
          source: "ip",
          accuracy: "low",
          cached: true,
        },
      });
    }

    const resolvedLocation =
      (await fetchFromProvider("ip-api.com", clientIp)) ??
      (await fetchFromProvider("ipapi.co", clientIp)) ??
      (await fetchFromProvider("ipwho.is", clientIp));

    if (!resolvedLocation) {
      return NextResponse.json(
        {
          success: false,
          message: "IP lookup did not return coordinates",
        },
        { status: 502 }
      );
    }

    ipLocationCache.set(cacheKey, {
      latitude: resolvedLocation.latitude,
      longitude: resolvedLocation.longitude,
      city: resolvedLocation.city,
      region: resolvedLocation.region,
      country: resolvedLocation.country,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json({
      success: true,
      data: {
        latitude: resolvedLocation.latitude,
        longitude: resolvedLocation.longitude,
        city: resolvedLocation.city,
        region: resolvedLocation.region,
        country: resolvedLocation.country,
        source: "ip",
        accuracy: "low",
        provider: resolvedLocation.source,
        cached: false,
      },
    });
  } catch (error) {
    console.error("IP location lookup failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
