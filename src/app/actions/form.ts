"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createForm(title: string, description: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const supabase = await createClient({ isAdmin: true });
    const { data, error } = await supabase
        .from("forms")
        .insert([
            {
                title,
                description,
                creator_id: session.id,
                status: "DRAFT",
            },
        ])
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath("/");
    return data;
}

export async function getForms(
    query? : string,
    status?: string,
    sort? : string,
) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const supabase = await createClient({ isAdmin: true });

    let dbQuery = supabase
        .from("forms")
        .select("*")
        .eq("creator_id", session.id);
    
    if (query) {
        dbQuery = dbQuery.ilike("title", `%${query}%`);
    }

    if (status && status !== "ALL"){
        dbQuery = dbQuery.eq("status", status);
    }

    if (sort === "OLDEST"){
        dbQuery = dbQuery.order("created_at", { ascending: true });
    } else {
        dbQuery = dbQuery.order("created_at", { ascending: false });
    }

    const { data, error } = await dbQuery;

    if (error) throw new Error(error.message);
    return data;
}

export async function getFormById(formId: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const supabase = await createClient({ isAdmin: true });
    const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .eq("creator_id", session.id)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateForm(
    formId: string,
    updates: { title?: string; description?: string; status?: string },
) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const supabase = await createClient({ isAdmin: true });
    const { data, error } = await supabase
        .from("forms")
        .update(updates)
        .eq("id", formId)
        .eq("creator_id", session.id)
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath(`/forms/${formId}`);
    return data;
}

export async function deleteForm(formId: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const supabase = await createClient({ isAdmin: true });
    const { error } = await supabase
        .from("forms")
        .delete()
        .eq("id", formId)
        .eq("creator_id", session.id);

    if (error) throw new Error(error.message);

    revalidatePath("/");
    return true;
}

export async function publishForm(formId: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const supabase = await createClient({ isAdmin: true });

    const { data, error } = await supabase
        .from("forms")
        .update({ status: "PUBLISHED" })
        .eq("id", formId)
        .eq("creator_id", session.id)
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath(`/forms/${formId}/edit`);
    revalidatePath("/");

    return data;
}

export async function updateFormStatus(formId: string, isPublished: boolean) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const supabase = await createClient({ isAdmin: true });

    const newStatus = isPublished ? "PUBLISHED" : "CLOSED";

    const { data, error } = await supabase
        .from("forms")
        .update({ status: newStatus })
        .eq("id", formId)
        .eq("creator_id", session.id)
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath(`/forms/${formId}/edit`);
    revalidatePath(`/forms/${formId}/preview`);
    revalidatePath("/");

    return data;
}
