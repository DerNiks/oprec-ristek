"use client";

import { useState, useTransition } from "react";
import { Question, Form } from "@/types/general";
import { submitForm, AnswerInput } from "@/app/actions/submission";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, Loader, Eraser, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function RespondentFormClient({
    form,
    questions,
    isCreator = false,
}: {
    form: Form;
    questions: Question[];
    isCreator?: boolean;
}) {
    const [answers, setAnswers] = useState<Record<string, string | string[]>>(
        {},
    );
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleCheckboxChange = (
        questionId: string,
        option: string,
        checked: boolean,
    ) => {
        setAnswers((prev) => {
            const currentAnswers = (prev[questionId] as string[]) || [];
            if (checked) {
                return { ...prev, [questionId]: [...currentAnswers, option] };
            } else {
                return {
                    ...prev,
                    [questionId]: currentAnswers.filter(
                        (ans) => ans !== option,
                    ),
                };
            }
        });
    };

    const handleClearAnswer = (questionId: string) => {
        setAnswers((prev) => {
            const newAnswers = { ...prev };
            delete newAnswers[questionId];
            return newAnswers;
        });
    };

    const handleClearAll = () => {
        if (confirm("Are you sure you want to clear all your answers?")) {
            setAnswers({});
            window.scrollTo({ top: 0, behavior: "smooth" });
            toast.info("Form cleared");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        for (const q of questions) {
            if (q.is_required) {
                const answer = answers[q.id];
                if (!answer || (Array.isArray(answer) && answer.length === 0)) {
                    toast.error("Validation Error", {
                        description: `Please answer the required question: "${q.text}"`,
                    });
                    return;
                }
            }
        }

        const formattedAnswers: AnswerInput[] = questions
            .map((q) => {
                const rawAnswer = answers[q.id];
                const stringValue = Array.isArray(rawAnswer)
                    ? JSON.stringify(rawAnswer)
                    : rawAnswer || "";

                return {
                    questionId: q.id,
                    value: stringValue,
                };
            })
            .filter((ans) => ans.value !== "");

        startTransition(async () => {
            try {
                await submitForm(form.id, formattedAnswers);
                setIsSubmitted(true);
                toast.success("Form submitted successfully!");
            } catch (error: unknown) {
                toast.error("Failed to submit form", {
                    description:
                        (error as Error).message || "Something went wrong.",
                });
            }
        });
    };

    if (isSubmitted) {
        return (
            <div className="max-w-2xl mx-auto mt-20 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                    <CheckCircle2 className="w-20 h-20 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Thank you!
                </h1>
                <p className="text-muted-foreground text-lg">
                    Your response has been recorded successfully.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            {isCreator && (
                <div className="bg-blue-100 dark:bg-blue-900/20 border-l-4 border-blue-500 text-blue-700 dark:text-blue-300 p-4 rounded shadow-sm mb-6 flex items-center justify-between">
                    <div>
                        <p className="font-bold">Creator Preview Mode</p>
                        <p className="text-sm">
                            You are viewing your form as a respondent.
                            Submission is disabled for you.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="bg-white dark:bg-slate-950 hover:bg-blue-50 text-blue-700 border-blue-200 ml-4"
                    >
                        <Link href={`/forms/${form.id}/edit`}>
                            Back to Edit
                        </Link>
                    </Button>
                </div>
            )}

            <Card className="border-t-8 border-t-primary shadow-md">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">
                        {form.title}
                    </CardTitle>
                    {form.description && (
                        <CardDescription className="text-base mt-2 whitespace-pre-wrap">
                            {form.description}
                        </CardDescription>
                    )}
                </CardHeader>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
                {questions.map((q) => {
                    const hasAnswer =
                        answers[q.id] &&
                        (Array.isArray(answers[q.id])
                            ? (answers[q.id] as string[]).length > 0
                            : true);

                    return (
                        <Card
                            key={q.id}
                            className="shadow-sm transition-all hover:shadow-md"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-medium leading-relaxed">
                                        {q.text}{" "}
                                        {q.is_required && (
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        )}
                                    </CardTitle>

                                    {hasAnswer && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs text-muted-foreground hover:text-red-500 -mt-1 -mr-2"
                                            onClick={() =>
                                                handleClearAnswer(q.id)
                                            }
                                            title="Clear answer"
                                        >
                                            <Eraser className="w-3 h-3 mr-1" />
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {q.type === "SHORT_ANSWER" && (
                                    <Input
                                        placeholder="Your answer"
                                        className="max-w-md border-b-2 border-t-0 border-l-0 border-r-0 rounded-none focus-visible:ring-0 focus-visible:border-b-primary px-0 bg-transparent"
                                        value={(answers[q.id] as string) || ""}
                                        onChange={(e) =>
                                            handleAnswerChange(
                                                q.id,
                                                e.target.value,
                                            )
                                        }
                                    />
                                )}

                                {q.type === "MULTIPLE_CHOICE" && (
                                    <RadioGroup
                                        value={(answers[q.id] as string) || ""}
                                        onValueChange={(val) =>
                                            handleAnswerChange(q.id, val)
                                        }
                                        className="space-y-3"
                                    >
                                        {(q.options || []).map((opt, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center space-x-3"
                                            >
                                                <RadioGroupItem
                                                    value={opt}
                                                    id={`${q.id}-${i}`}
                                                />
                                                <Label
                                                    htmlFor={`${q.id}-${i}`}
                                                    className="text-base font-normal cursor-pointer"
                                                >
                                                    {opt}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                )}

                                {q.type === "CHECKBOX" && (
                                    <div className="space-y-3">
                                        {(q.options || []).map((opt, i) => {
                                            const isChecked = (
                                                (answers[q.id] as string[]) ||
                                                []
                                            ).includes(opt);
                                            return (
                                                <div
                                                    key={i}
                                                    className="flex items-center space-x-3"
                                                >
                                                    <Checkbox
                                                        id={`${q.id}-${i}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            handleCheckboxChange(
                                                                q.id,
                                                                opt,
                                                                checked as boolean,
                                                            )
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`${q.id}-${i}`}
                                                        className="text-base font-normal cursor-pointer"
                                                    >
                                                        {opt}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {q.type === "DROPDOWN" && (
                                    <Select
                                        value={(answers[q.id] as string) || ""}
                                        onValueChange={(val) =>
                                            handleAnswerChange(q.id, val)
                                        }
                                    >
                                        <SelectTrigger className="max-w-md">
                                            <SelectValue placeholder="Choose an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(q.options || []).map((opt, i) => (
                                                <SelectItem key={i} value={opt}>
                                                    {opt}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}

                <div className="flex justify-between items-center pt-8 border-t">
                    <Button
                        type="button"
                        variant="ghost"
                        className="text-muted-foreground hover:text-red-600"
                        onClick={handleClearAll}
                        disabled={
                            Object.keys(answers).length === 0 || isCreator
                        }
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset Form
                    </Button>

                    {isCreator ? (
                        <Button
                            type="button"
                            disabled
                            className="px-8 bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"
                        >
                            Creator Cannot Submit
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            size="lg"
                            disabled={isPending || questions.length === 0}
                            className="px-8"
                        >
                            {isPending ? (
                                <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                                "Submit"
                            )}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
