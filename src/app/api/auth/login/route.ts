import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful (Returns Token)
 *       401:
 *         description: Invalid credentials
 */
export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        const supabase = await createClient({ isAdmin: true });

        const { data: user } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 },
            );
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({ id: user.id, email: user.email })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(secret);

        return NextResponse.json({ message: "Login successful", token });
    } catch (error) {
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
