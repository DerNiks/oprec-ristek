import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

/**
 * @swagger
 * /api/forms/{id}:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Forms
 *     summary: Get form details and questions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Form details
 *   delete:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Forms
 *     summary: Delete a form
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Form deleted
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const supabase = await createClient({ isAdmin: true });

    const { data: form } = await supabase
        .from("forms")
        .select("*")
        .eq("id", id)
        .single();
    if (!form)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: questions } = await supabase
        .from("questions")
        .select("*")
        .eq("form_id", id)
        .order("order");

    return NextResponse.json({ ...form, questions });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getSession();
    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const supabase = await createClient({ isAdmin: true });

    const { error, count } = await supabase
        .from("forms")
        .delete({ count: "exact" })
        .eq("id", id)
        .eq("creator_id", session.id);

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });

    if (count === 0) {
        return NextResponse.json(
            {
                error: "Forbidden: You do not have permission to delete this form or form not found.",
            },
            { status: 403 },
        );
    }

    return NextResponse.json({ message: "Form deleted successfully" });
}
