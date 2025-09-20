import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { jwtsecret } from "./components/data";

export const config = {
  matcher: ["/user/:path*", "/admin/:path*", "/login"],
};

const SECRET_KEY = new TextEncoder().encode(jwtsecret);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const jwt = request.cookies.get("token")?.value;
  const url = request.nextUrl.clone();
  const path = request.nextUrl.pathname;

  const isProtectedPath = path.startsWith("/user") || path.startsWith("/admin");

  if (!jwt && isProtectedPath) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (jwt) {
    const extractedJWTData = await verifyToken(jwt);

    if (!extractedJWTData) {
      // Invalid JWT, clear token from cookies in response
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }

    const userRole = (extractedJWTData as any)?.role;
    const userRoom = (extractedJWTData as any)?.room;

    // Redirect authenticated users away from login page
    if (path === "/login") {
      url.pathname = userRole === "admin" ? "/admin/main" : "/user/main";
      return NextResponse.redirect(url);
    }

    if ((path !== "/user/queue") && !userRoom && userRole == 'user') {
      url.pathname = "/user/queue"; // Redirect unauthorized access
      return NextResponse.redirect(url);

    }

    // Protect admin pages
    if (path.startsWith("/admin") && userRole !== "admin") {
      url.pathname = "/user/main"; // Redirect unauthorized access
      return NextResponse.redirect(url);
    }
    
    // Protect user pages
    if (path.startsWith("/user") && userRole !== "user") {
      url.pathname = "/admin/main"; // Redirect unauthorized access
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
