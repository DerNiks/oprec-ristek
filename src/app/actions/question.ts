"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Question } from "@/types/general";
import { SupabaseClient } from "@supabase/supabase-js";

async function verifyFormOwnership(formId: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const supabase = await createClient({ isAdmin: true });

    const { data: form, error } = await supabase
        .from("forms")
        .select("id")
        .eq("id", formId)
        .eq("creator_id", session.id)
        .single();

    if (error || !form)
        throw new Error("You do not have permission to edit this form.");

    return supabase;
}

export async function getQuestions(formId: string) {
    const supabase = await createClient({ isAdmin: true });

    const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("form_id", formId)
        .order("order", { ascending: true })
        .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return data;
}

export async function createQuestion(formId: string) {
    const supabase = await verifyFormOwnership(formId);

    const hasSubmissions = await checkFormHasSubmissions(supabase, formId);
    if (hasSubmissions) {
        throw new Error(
            "Cannot add new questions because this form already has responses. To modify the structure, please delete all responses first.",
        );
    }
    const { count } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("form_id", formId);

    const { data, error } = await supabase
        .from("questions")
        .insert([
            {
                form_id: formId,
                text: "Untitled Question",
                type: "SHORT_ANSWER",
                is_required: false,
                options: [], 
                order: count || 0,
            },
        ])
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath(`/forms/${formId}/edit`);
    return data;
}
async function checkFormHasSubmissions(supabase: SupabaseClient, formId: string) {
    const { count, error } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("form_id", formId);

    if (error) throw new Error("Failed to check submissions");

    return count && count > 0;
}

export async function deleteQuestion(formId: string, questionId: string) {
    const supabase = await verifyFormOwnership(formId);

    const hasSubmissions = await checkFormHasSubmissions(supabase, formId);
    
    if (hasSubmissions) {
        throw new Error("Cannot delete question because this form already has collected responses. Try 'Closing' the form instead.");
    }

    const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", questionId)
        .eq("form_id", formId);

    if (error) throw new Error(error.message);
    
    revalidatePath(`/forms/${formId}/edit`);
    return true;
}

export async function updateQuestion(formId: string, questionId: string, updates: Partial<Question>) {
    const supabase = await verifyFormOwnership(formId);

    if (updates.type) {
        const hasSubmissions = await checkFormHasSubmissions(supabase, formId);
        if (hasSubmissions) {
            const { data: currentQ } = await supabase.from("questions").select("type").eq("id", questionId).single();
            
            if (currentQ && currentQ.type !== updates.type) {
                throw new Error("Cannot change question type because response data already exists.");
            }
        }
    }

    const { data, error } = await supabase
        .from("questions")
        .update(updates)
        .eq("id", questionId)
        .eq("form_id", formId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    
    revalidatePath(`/forms/${formId}/edit`);
    return data;
}

export async function updateQuestionOrder(
    formId: string,
    orderedQuestions: { id: string; order: number }[],
) {
    const supabase = await verifyFormOwnership(formId);
    for (const q of orderedQuestions) {
        await supabase
            .from("questions")
            .update({ order: q.order })
            .eq("id", q.id);
    }

    revalidatePath(`/forms/${formId}/edit`);
    return true;
}
