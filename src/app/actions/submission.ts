"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

export interface AnswerInput {
    questionId: string;
    value: string;
}

export async function getFormResponses(formId: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const supabase = await createClient({ isAdmin: true });

    const { data: form, error: formError } = await supabase
        .from("forms")
        .select("id, title")
        .eq("id", formId)
        .eq("creator_id", session.id)
        .single();

    if (formError || !form)
        throw new Error("You do not have permission to view these responses.");

    const { data: questions } = await supabase
        .from("questions")
        .select("*")
        .eq("form_id", formId)
        .order("order", { ascending: true })
        .order("created_at", { ascending: true });

    const { data: submissions } = await supabase
        .from("submissions")
        .select(
            `
            id,
            created_at,
            answers ( question_id, value )
        `,
        )
        .eq("form_id", formId)
        .order("created_at", { ascending: false });

    return {
        form,
        questions: questions || [],
        submissions: submissions || [],
    };
}

export async function submitForm(formId: string, answers: AnswerInput[]) {
    const session = await getSession();
    if (!session) throw new Error("You must be logged in to submit this form.");

    const supabase = await createClient({ isAdmin: true });

    try {
        const { count } = await supabase
            .from("submissions")
            .select("*", { count: "exact", head: true })
            .eq("form_id", formId)
            .eq("respondent_id", session.id);

        if (count && count > 0) {
            throw new Error(
                "You have already submitted a response to this form.",
            );
        }

        const { data: submission, error: submissionError } = await supabase
            .from("submissions")
            .insert([
                {
                    form_id: formId,
                    respondent_id: session.id,
                },
            ])
            .select()
            .single();

        if (submissionError || !submission) {
            if (submissionError?.code === "23505") {
                throw new Error("You have already submitted a response.");
            }
            throw new Error(
                submissionError?.message || "Failed to create submission",
            );
        }

        const answersData = answers.map((ans) => ({
            submission_id: submission.id,
            question_id: ans.questionId,
            value: ans.value,
        }));

        if (answersData.length > 0) {
            const { error: answersError } = await supabase
                .from("answers")
                .insert(answersData);

            if (answersError) {
                await supabase
                    .from("submissions")
                    .delete()
                    .eq("id", submission.id);
                throw new Error(answersError.message);
            }
        }

        return { success: true, submissionId: submission.id };
    } catch (error: unknown) {
        throw new Error(
            (error as Error).message || "An error occurred during submission",
        );
    }
}
