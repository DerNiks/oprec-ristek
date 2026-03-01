"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    PlusCircle,
    Trash2,
    Plus,
    X,
    AlignLeft,
    CheckSquare,
    CircleDot,
    ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
    createQuestion,
    deleteQuestion,
    updateQuestion,
    updateQuestionOrder,
} from "@/app/actions/question";
import { Question, QuestionType } from "@/types/general";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableQuestionItem } from "./sortable-question-item";

const QuestionTypeIcon = ({ type }: { type: string }) => {
    switch (type) {
        case "SHORT_ANSWER":
            return <AlignLeft className="w-4 h-4 mr-2 text-blue-500" />;
        case "MULTIPLE_CHOICE":
            return <CircleDot className="w-4 h-4 mr-2 text-indigo-500" />;
        case "CHECKBOX":
            return <CheckSquare className="w-4 h-4 mr-2 text-green-500" />;
        case "DROPDOWN":
            return <ChevronDown className="w-4 h-4 mr-2 text-orange-500" />;
        default:
            return <AlignLeft className="w-4 h-4 mr-2" />;
    }
};

export default function EditFormClient({
    formId,
    initialQuestions,
}: {
    formId: string;
    initialQuestions: Question[];
}) {
    const [questions, setQuestions] = useState(initialQuestions);
    const [isPending, startTransition] = useTransition();

    const handleAddQuestion = () => {
        startTransition(async () => {
            try {
                const newQ = await createQuestion(formId);
                setQuestions([...questions, newQ]);
                toast.success("Question added");
            } catch (error) {
                toast.error("Failed to add question");
            }
        });
    };

    const handleDeleteQuestion = (qId: string) => {
        const previousQuestions = questions;
        setQuestions(questions.filter((q) => q.id !== qId));

        startTransition(async () => {
            try {
                await deleteQuestion(formId, qId);
                toast.success("Question deleted");
            } catch (error: unknown) {
                setQuestions(previousQuestions);

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to delete question";

                toast.error("Deletion Failed", {
                    description: errorMessage,
                    duration: 5000,
                });
            }
        });
    };

    const handleUpdateQuestion = (qId: string, updates: Partial<Question>) => {
        const previousQuestions = questions;
        setQuestions(
            questions.map((q) => (q.id === qId ? { ...q, ...updates } : q)),
        );

        startTransition(async () => {
            try {
                await updateQuestion(formId, qId, updates);
            } catch (error: unknown) {
                setQuestions(previousQuestions);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to save changes";

                toast.error("Update Failed", {
                    description: errorMessage,
                    duration: 4000,
                });
            }
        });
    };

    const handleAddOption = (qId: string, currentOptions: string[]) => {
        const newOptions = [
            ...currentOptions,
            `Option ${currentOptions.length + 1}`,
        ];
        handleUpdateQuestion(qId, { options: newOptions });
    };

    const handleUpdateOption = (
        qId: string,
        currentOptions: string[],
        optIndex: number,
        newValue: string,
    ) => {
        const newOptions = [...currentOptions];
        newOptions[optIndex] = newValue;
        setQuestions(
            questions.map((q) =>
                q.id === qId ? { ...q, options: newOptions } : q,
            ),
        );
    };

    const handleRemoveOption = (
        qId: string,
        currentOptions: string[],
        optIndex: number,
    ) => {
        const newOptions = currentOptions.filter((_, idx) => idx !== optIndex);
        handleUpdateQuestion(qId, { options: newOptions });
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = questions.findIndex((q) => q.id === active.id);
            const newIndex = questions.findIndex((q) => q.id === over.id);
            const newItems = arrayMove(questions, oldIndex, newIndex);
            setQuestions(newItems);
            startTransition(async () => {
                const updates = newItems.map((q, index) => ({
                    id: q.id,
                    order: index,
                }));
                await updateQuestionOrder(formId, updates);
            });
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={questions.map((q) => q.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {questions.map((q, index) => {
                        const isOptionType = [
                            "MULTIPLE_CHOICE",
                            "CHECKBOX",
                            "DROPDOWN",
                        ].includes(q.type);

                        return (
                            <SortableQuestionItem key={q.id} id={q.id}>
                                <Card className="group relative border-l-4 border-l-transparent hover:border-l-primary transition-all shadow-sm hover:shadow-md">
                                    <CardHeader className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pb-4 pt-6">
                                        <Input
                                            value={q.text}
                                            onChange={(e) =>
                                                setQuestions(
                                                    questions.map((question) =>
                                                        question.id === q.id
                                                            ? {
                                                                  ...question,
                                                                  text: e.target
                                                                      .value,
                                                              }
                                                            : question,
                                                    ),
                                                )
                                            }
                                            onBlur={(e) =>
                                                handleUpdateQuestion(q.id, {
                                                    text: e.target.value,
                                                })
                                            }
                                            className="text-lg font-medium border-transparent hover:border-input focus-visible:ring-1 bg-transparent px-2 -ml-2 h-12"
                                            placeholder="Question text"
                                        />

                                        <Select
                                            value={q.type}
                                            onValueChange={(value) =>
                                                handleUpdateQuestion(q.id, {
                                                    type: value as QuestionType,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="w-full sm:w-56 shrink-0">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="SHORT_ANSWER">
                                                    <span className="flex items-center">
                                                        <QuestionTypeIcon type="SHORT_ANSWER" />{" "}
                                                        Short Answer
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="MULTIPLE_CHOICE">
                                                    <span className="flex items-center">
                                                        <QuestionTypeIcon type="MULTIPLE_CHOICE" />{" "}
                                                        Multiple Choice
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="CHECKBOX">
                                                    <span className="flex items-center">
                                                        <QuestionTypeIcon type="CHECKBOX" />{" "}
                                                        Checkboxes
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="DROPDOWN">
                                                    <span className="flex items-center">
                                                        <QuestionTypeIcon type="DROPDOWN" />{" "}
                                                        Dropdown
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </CardHeader>

                                    <CardContent className="pb-4">
                                        {!isOptionType ? (
                                            <Input
                                                disabled
                                                placeholder="Short answer text"
                                                className="bg-slate-50 dark:bg-slate-900/50 w-2/3 border-dashed"
                                            />
                                        ) : (
                                            <div className="space-y-3 mt-2">
                                                {(q.options || []).map(
                                                    (
                                                        opt: string,
                                                        optIndex: number,
                                                    ) => (
                                                        <div
                                                            key={optIndex}
                                                            className="flex items-center gap-3"
                                                        >
                                                            <div className="text-muted-foreground">
                                                                {q.type ===
                                                                "MULTIPLE_CHOICE" ? (
                                                                    <CircleDot className="w-4 h-4" />
                                                                ) : q.type ===
                                                                  "CHECKBOX" ? (
                                                                    <CheckSquare className="w-4 h-4" />
                                                                ) : (
                                                                    <span className="text-sm font-medium w-4 inline-block text-center">
                                                                        {optIndex +
                                                                            1}
                                                                        .
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Input Options */}
                                                            <Input
                                                                value={opt}
                                                                onChange={(e) =>
                                                                    handleUpdateOption(
                                                                        q.id,
                                                                        q.options,
                                                                        optIndex,
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                onBlur={() =>
                                                                    handleUpdateQuestion(
                                                                        q.id,
                                                                        {
                                                                            options:
                                                                                q.options,
                                                                        },
                                                                    )
                                                                } 
                                                                className="h-9 hover:border-input border-transparent focus-visible:ring-1 px-2 -ml-2"
                                                            />

                                                            {/* Delete Options */}
                                                            {q.options.length >
                                                                1 && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:text-red-500 shrink-0"
                                                                    onClick={() =>
                                                                        handleRemoveOption(
                                                                            q.id,
                                                                            q.options,
                                                                            optIndex,
                                                                        )
                                                                    }
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ),
                                                )}

                                                {/* Add Options */}
                                                <div className="flex items-center gap-3 pt-2">
                                                    <div className="w-4"></div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-muted-foreground hover:text-primary"
                                                        onClick={() =>
                                                            handleAddOption(
                                                                q.id,
                                                                q.options || [],
                                                            )
                                                        }
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />{" "}
                                                        Add option
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>

                                    <Separator />

                                    <CardFooter className="flex justify-end items-center gap-6 pt-4 pb-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-b-xl">
                                        {/* Toggle Required */}
                                        <div className="flex items-center gap-2">
                                            <Label
                                                htmlFor={`required-${q.id}`}
                                                className="text-sm font-medium text-muted-foreground cursor-pointer"
                                            >
                                                Required
                                            </Label>
                                            <Switch
                                                id={`required-${q.id}`}
                                                checked={q.is_required}
                                                onCheckedChange={(checked) =>
                                                    handleUpdateQuestion(q.id, {
                                                        is_required: checked,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="w-px h-6 bg-border"></div>

                                        {/* Delete Question */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                            onClick={() =>
                                                handleDeleteQuestion(q.id)
                                            }
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </SortableQuestionItem>
                        );
                    })}
                </SortableContext>
            </DndContext>

            {/* Add Question */}
            <div className="flex justify-center mt-8">
                <Button
                    size="lg"
                    className="rounded-full shadow-lg hover:shadow-xl transition-all h-14 px-8"
                    onClick={handleAddQuestion}
                    disabled={isPending}
                >
                    <PlusCircle className="w-6 h-6 mr-2" />
                    Add Question
                </Button>
            </div>
        </div>
    );
}
