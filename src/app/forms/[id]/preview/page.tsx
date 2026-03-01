import { createClient } from "@/lib/supabase/server";
import { getQuestions } from "@/app/actions/question";
import { getSession } from "@/lib/auth";
import RespondentFormClient from "./_components/respondent-form-client";
import { Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";

export default async function PreviewFormPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const formId = resolvedParams.id;
    const session = await getSession();

    const supabase = await createClient({ isAdmin: true });

    const { data: form } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .single();

    if (!form) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <h1 className="text-2xl font-bold text-muted-foreground">
                    Form not found.
                </h1>
            </div>
        );
    }

    const isCreator = session?.id === form.creator_id;

    let hasResponded = false;

    if (session && !isCreator) {
        const { count } = await supabase
            .from("submissions")
            .select("*", { count: "exact", head: true })
            .eq("form_id", formId)
            .eq("respondent_id", session.id);

        if (count && count > 0) {
            hasResponded = true;
        }
    }

    if (hasResponded) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <div className="bg-background p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-border animate-in fade-in zoom-in duration-300">
                    <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-foreground">
                        You&apos;ve already responded
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        You have already filled out this form. <br />
                        Thank you for your participation!
                    </p>
                    <form action={logout}>
                        <Button variant="outline" size="sm">Logout to switch account</Button>
                    </form>
                </div>
            </div>
        );
    }

    if (form.status === "CLOSED" && !isCreator) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <div className="bg-background p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-border">
                    <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-foreground">
                        {form.title}
                    </h1>
                    <p className="text-red-500 font-medium text-lg mb-4">
                        This form is no longer accepting responses.
                    </p>
                </div>
            </div>
        );
    }

    const questions = await getQuestions(formId);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
            <RespondentFormClient
                form={form}
                questions={questions || []}
                isCreator={isCreator}
            />
        </div>
    );
}
