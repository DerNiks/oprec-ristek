import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("custom_session_token")?.value;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    let isValidToken = false;

    if (token) {
        try {
            await jwtVerify(token, secret);
            isValidToken = true;
        } catch {
            isValidToken = false;
        }
    }

    const { pathname } = request.nextUrl;

    const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register");

    const isPublicApi =
        pathname.startsWith("/api") || pathname.startsWith("/api-doc");

    if (!isValidToken && !isAuthPage && !isPublicApi) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
    }

    if (isValidToken && isAuthPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
