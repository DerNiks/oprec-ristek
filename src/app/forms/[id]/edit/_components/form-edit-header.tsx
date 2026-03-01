"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Share2, BarChart, Lock } from "lucide-react";
import Link from "next/link";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { publishForm, updateFormStatus } from "@/app/actions/form";
import { Form } from "@/types/general";
import EditFormInfoDialog from "./edit-form-info-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function FormEditHeader({ form }: { form: Form }) {
    const [isPending, startTransition] = useTransition();

    const [isPublished, setIsPublished] = useState(form.status === "PUBLISHED");

    const handlePublish = () => {
        startTransition(async () => {
            try {
                await publishForm(form.id);
                const publicUrl = `${window.location.origin}/forms/${form.id}/preview`;
                await navigator.clipboard.writeText(publicUrl);

                toast.success("Form Published & Link Copied!", {
                    description:
                        "The public link has been copied to your clipboard.",
                });
            } catch (error) {
                toast.error("Failed to publish form");
            }
        });
    };

    const handleStatusToggle = (checked: boolean) => {
        setIsPublished(checked);

        startTransition(async () => {
            try {
                await updateFormStatus(form.id, checked);
                toast.success(
                    checked
                        ? "Form is now accepting responses"
                        : "Form is now closed",
                );
            } catch (error) {
                setIsPublished(!checked);
                toast.error("Failed to update status");
            }
        });
    };

    return (
        <div className="sticky top-14 z-40 bg-background/95 backdrop-blur border-b shadow-sm px-4 py-3">
            <div className="container mx-auto max-w-4xl flex justify-between items-center">
                <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="shrink-0 p-0 sm:px-3 text-muted-foreground hover:text-foreground"
                    >
                        <Link href="/">
                            <ArrowLeft className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Back</span>
                        </Link>
                    </Button>

                    <div className="flex items-center gap-2 truncate">
                        <h1 className="font-semibold truncate text-sm sm:text-lg">
                            {form.title}
                        </h1>
                        <EditFormInfoDialog form={form} />
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <div className="flex items-center gap-2 border-r pr-2 mr-1 sm:pr-4 sm:mr-2">
                        <Switch
                            id="form-status"
                            checked={isPublished}
                            onCheckedChange={handleStatusToggle}
                            disabled={isPending}
                        />
                        <Label
                            htmlFor="form-status"
                            className="hidden sm:block text-xs font-medium cursor-pointer text-muted-foreground"
                        >
                            {isPublished ? "Accepting Responses" : "Closed"}
                        </Label>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        title="View Results"
                    >
                        <Link href={`/forms/${form.id}/responses`}>
                            <BarChart className="w-4 h-4 text-muted-foreground" />
                        </Link>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="hidden sm:flex"
                        disabled={!isPublished}
                    >
                        <Link
                            href={`/forms/${form.id}/preview`}
                            target="_blank"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Preview
                        </Link>
                    </Button>

                    <Button
                        size="sm"
                        onClick={handlePublish}
                        disabled={isPending || !isPublished}
                        className={
                            isPublished
                                ? "bg-green-600 hover:bg-green-700"
                                : "opacity-50"
                        }
                    >
                        {isPublished ? (
                            <Share2 className="w-4 h-4 mr-2" />
                        ) : (
                            <Lock className="w-4 h-4 mr-2" />
                        )}
                        {isPublished ? "Share Link" : "Closed"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
