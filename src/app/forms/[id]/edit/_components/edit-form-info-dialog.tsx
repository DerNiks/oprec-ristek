"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createFormSchema,
    CreateFormValues,
} from "@/validations/form-validation";
import { updateForm } from "@/app/actions/form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Pencil, Loader2 } from "lucide-react";
import { Form as FormType } from "@/types/general";

export default function EditFormInfoDialog({ form }: { form: FormType }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const formHook = useForm<CreateFormValues>({
        resolver: zodResolver(createFormSchema),
        defaultValues: {
            title: form.title,
            description: form.description || "",
        },
    });

    const onSubmit = (values: CreateFormValues) => {
        startTransition(async () => {
            try {
                await updateForm(form.id, values);
                toast.success("Form info updated");
                setOpen(false);
            } catch (error) {
                toast.error("Failed to update form info");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2 text-muted-foreground hover:text-foreground"
                >
                    <Pencil className="w-3 h-3" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Edit Form Details</DialogTitle>
                </DialogHeader>
                <Form {...formHook}>
                    <form
                        onSubmit={formHook.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={formHook.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={formHook.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            className="resize-none h-24"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
