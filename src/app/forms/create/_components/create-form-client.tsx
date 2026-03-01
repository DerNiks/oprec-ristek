"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createFormSchema,
    CreateFormValues,
} from "@/validations/form-validation";
import { toast } from "sonner";
import FormInput from "@/common/form-input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader, ArrowLeft, PlusCircle } from "lucide-react";
import Link from "next/link";
import { createForm } from "@/app/actions/form";

export default function CreateFormClient() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const form = useForm<CreateFormValues>({
        resolver: zodResolver(createFormSchema),
        defaultValues: {
            title: "",
            description: "",
        },
    });

    const onSubmit = (data: CreateFormValues) => {
        setIsPending(true);
        startTransition(async () => {
            try {
                await createForm(data.title, data.description || "");

                toast.success("Form created successfully!");
                router.push("/");
                router.refresh();
            } catch (error: unknown) {
                toast.error("Failed to create form", {
                    description:
                        (error as Error).message || "Something went wrong",
                });
            } finally {
                setIsPending(false);
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Button
                variant="ghost"
                asChild
                className="mb-6 -ml-4 text-muted-foreground hover:text-foreground"
            >
                <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>
            </Button>

            <Card className="border-t-4 border-t-primary shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                        <PlusCircle className="w-6 h-6 mr-2 text-primary" />
                        Create New Form
                    </CardTitle>
                    <CardDescription>
                        Give your form a title and description to get started.
                        You can add questions later.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormInput
                                form={form}
                                name="title"
                                label="Form Title"
                                placeholder="e.g., Customer Feedback Survey"
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Description (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Explain what this form is about..."
                                                className="resize-none h-24"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    disabled={isPending}
                                >
                                    <Link href="/">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? (
                                        <>
                                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Create Form"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
