"use client";

import FormInput from "@/common/form-input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
    RegisterForm,
    registerSchemaForm,
} from "@/validations/auth-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { register } from "../actions";
import { CheckCircle2, Circle, Loader } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
    INITIAL_REGISTER_FORM,
    INITIAL_STATE_REGISTER_FORM,
} from "@/constants/auth-constant";

export default function Register() {
    const form = useForm<RegisterForm>({
        resolver: zodResolver(registerSchemaForm),
        defaultValues: INITIAL_REGISTER_FORM,
        mode: "onChange",
    });

    const [registerState, registerAction, isPendingRegister] = useActionState(
        register,
        INITIAL_STATE_REGISTER_FORM,
    );

    const onSubmit = form.handleSubmit(async (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });

        startTransition(() => {
            registerAction(formData);
        });
    });

    useEffect(() => {
        if (
            registerState?.status === "error" &&
            registerState.errors?._form?.length
        ) {
            toast.error("Registration Failed", {
                description: registerState.errors._form[0],
            });
        }
    }, [registerState]);

    const passwordValue = form.watch("password") || "";

    const passwordRequirements = [
        { text: "At least 8 characters", isMet: passwordValue.length >= 8 },
        {
            text: "At least 1 uppercase letter",
            isMet: /[A-Z]/.test(passwordValue),
        },
        {
            text: "At least 1 lowercase letter",
            isMet: /[a-z]/.test(passwordValue),
        },
        { text: "At least 1 number", isMet: /[0-9]/.test(passwordValue) },
        {
            text: "At least 1 special character",
            isMet: /[\W_]/.test(passwordValue),
        },
    ];

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Create Account</CardTitle>
                <CardDescription>
                    Sign up to start building your forms
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <FormInput
                            form={form}
                            name="name"
                            label="Full Name"
                            placeholder="Insert your full name"
                            type="text"
                        />
                        <FormInput
                            form={form}
                            name="email"
                            label="Email"
                            placeholder="Insert your email"
                            type="email"
                        />

                        <div className="space-y-2">
                            <FormInput
                                form={form}
                                name="password"
                                label="Password"
                                placeholder="********"
                                type="password"
                                hideMessage={true}
                            />

                            <div className="space-y-1 mt-2">
                                {passwordRequirements.map((req, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center text-sm transition-colors duration-200 ${
                                            req.isMet
                                                ? "text-green-600"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {req.isMet ? (
                                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                                        ) : (
                                            <Circle className="w-4 h-4 mr-2" />
                                        )}
                                        {req.text}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-4"
                            disabled={isPendingRegister}
                        >
                            {isPendingRegister ? (
                                <Loader className="animate-spin" />
                            ) : (
                                "Register"
                            )}
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="underline">
                        Sign in
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
