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
    INITIAL_LOGIN_FORM,
    INITIAL_STATE_LOGIN_FORM,
} from "@/constants/auth-constant";
import { LoginForm, loginSchemaForm } from "@/validations/auth-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { login } from "../actions";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Login() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const form = useForm<LoginForm>({
        resolver: zodResolver(loginSchemaForm),
        defaultValues: INITIAL_LOGIN_FORM,
    });

    const [loginState, loginAction, isPendingLogin] = useActionState(
        login,
        INITIAL_STATE_LOGIN_FORM,
    );

    const onSubmit = form.handleSubmit(async (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        const currentCallbackUrl = searchParams.get("callbackUrl") || "/";
        formData.append("callbackUrl", currentCallbackUrl);

        startTransition(() => {
            loginAction(formData);
        });
    });

    useEffect(() => {
        if (loginState?.status === "error") {
            toast.error("Login Failed", {
                description: loginState.errors?._form?.[0],
            });
            startTransition(() => {
                loginAction(null);
            });
        }
    }, [loginAction, loginState]);

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Welcome</CardTitle>
                <CardDescription>Login to your account</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <input
                            type="hidden"
                            name="callbackUrl"
                            value={callbackUrl}
                        />
                        <FormInput
                            form={form}
                            name="email"
                            label="Email"
                            placeholder="Insert your email"
                            type="email"
                        />
                        <FormInput
                            form={form}
                            name="password"
                            label="Password"
                            placeholder="********"
                            type="password"
                        />
                        <Button type="submit">
                            {isPendingLogin ? (
                                <Loader className="animate-spin" />
                            ) : (
                                "Login"
                            )}
                        </Button>
                        <div className="mt-4 text-center text-sm">
                            <span className="text-muted-foreground">
                                Don&apos;t have an account?{" "}
                            </span>
                            <Link
                                href="/register"
                                className="text-primary hover:underline font-medium"
                            >
                                Sign up
                            </Link>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
