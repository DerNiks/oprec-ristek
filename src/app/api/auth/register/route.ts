import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;
        const supabase = await createClient({ isAdmin: true });

        const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .single();
        if (existingUser)
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 400 },
            );

        const hashedPassword = await bcrypt.hash(password, 10);

        const { error } = await supabase
            .from("users")
            .insert([{ name, email, password: hashedPassword }]);
        if (error) throw error;

        return NextResponse.json(
            { message: "User registered successfully" },
            { status: 201 },
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Registration failed" },
            { status: 500 },
        );
    }
}
