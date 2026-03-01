"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteForm } from "@/app/actions/form";
import { toast } from "sonner";

export default function DeleteFormButton({ formId }: { formId: string }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            try {
                await deleteForm(formId);
                toast.success("Form deleted successfully");
                setOpen(false);
            } catch (error) {
                toast.error("Failed to delete form");
            }
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your form and
                        <span className="font-bold text-red-500">
                            {" "}
                            all collected responses
                        </span>
                        .
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
