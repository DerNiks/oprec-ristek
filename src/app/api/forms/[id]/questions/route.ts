import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

/**
 * @swagger
 * /api/forms/{id}/questions:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags: [Questions]
 *     summary: Add a question to a form
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text: { type: string }
 *               type: { type: string, enum: [SHORT_ANSWER, MULTIPLE_CHOICE, CHECKBOX, DROPDOWN] }
 *     responses:
 *       201:
 *         description: Question created
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getSession();
    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient({ isAdmin: true });

    const { data, error } = await supabase
        .from("questions")
        .insert([{ ...body, form_id: id }])
        .select()
        .single();

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}
