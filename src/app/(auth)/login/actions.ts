"use server";

import { INITIAL_STATE_LOGIN_FORM } from "@/constants/auth-constant";
import { createClient } from "@/lib/supabase/server";
import { AuthFormState } from "@/types/auth";
import { loginSchemaForm } from "@/validations/auth-validation";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(
    prevState: AuthFormState,
    formData: FormData | null,
) {
    if (!formData) return INITIAL_STATE_LOGIN_FORM;

    const validatedFields = loginSchemaForm.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!validatedFields.success) {
        return {
            status: "error",
            errors: {
                ...validatedFields.error.flatten().fieldErrors,
                _form: [],
            },
        };
    }

    const { email, password } = validatedFields.data;
    const callbackUrl = (formData.get("callbackUrl") as string) || "/";

    try {
        const supabase = await createClient({ isAdmin: true });

        const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (userError || !user) {
            return {
                status: "error",
                errors: { _form: ["Invalid email or password"] },
            };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return {
                status: "error",
                errors: { _form: ["Invalid email or password"] },
            };
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({
            id: user.id,
            email: user.email,
            name: user.name,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(secret);

        const cookieStore = await cookies();
        cookieStore.set("custom_session_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 1,
        });
    } catch (error: unknown) {
        return {
            status: "error",
            errors: {
                _form: [(error as Error).message || "Failed to login"],
            },
        };
    }

    redirect(callbackUrl);
}
