import { cookies, headers } from "next/headers";
import { jwtVerify } from "jose";

export async function getSession() {
    const headerStore = await headers();
    const authHeader = headerStore.get("Authorization");
    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
        console.log("🔹 [Auth] Token detected in Header");
    } else {
        const cookieStore = await cookies();
        token = cookieStore.get("custom_session_token")?.value;
        if (token) console.log("🔸 [Auth] Token detected in Cookie");
    }

    if (!token) {
        console.log("❌ [Auth] No token found in Header or Cookie");
        return null;
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload as { id: string; email: string; name: string };
    } catch (error) {
        console.log("❌ [Auth] Invalid Token:", error);
        return null;
    }
}
