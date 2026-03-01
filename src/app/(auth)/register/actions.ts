"use server";

import { createClient } from "@/lib/supabase/server";
import { registerSchemaForm } from "@/validations/auth-validation";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { AuthFormState } from "@/types/auth";

export async function register(
    prevState: AuthFormState, 
    formData: FormData | null,
) {
    if (!formData) {
        return {
            status: "idle",
            errors: {},
        } as AuthFormState;
    }

    const rawData = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
    };

    const validatedFields = registerSchemaForm.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            status: "error",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, email, password } = validatedFields.data;

    try {
        const supabase = await createClient({ isAdmin: true });

        const { data: existingEmail } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .single();

        if (existingEmail) {
            return {
                status: "error",
                errors: {
                    email: [
                        "Email is already registered. Please login instead.",
                    ],
                },
            };
        }

        const { data: existingName } = await supabase
            .from("users")
            .select("id")
            .eq("name", name)
            .single();

        if (existingName) {
            return {
                status: "error",
                errors: {
                    name: [
                        "Username is already taken. Please choose another one.",
                    ],
                },
            };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { error } = await supabase
            .from("users")
            .insert([{ name, email, password: hashedPassword }]);

        if (error) {
            throw error;
        }
    } catch (error: unknown) {
        return {
            status: "error",
            errors: {
                _form: [
                    (error as Error).message || "Failed to register account",
                ],
            },
        };
    }

    redirect("/login");
}
