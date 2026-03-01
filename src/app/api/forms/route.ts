import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

/**
 * @swagger
 * /api/forms:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Forms
 *     summary: Get all forms
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Form'
 *       401:
 *         description: Unauthorized
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Forms
 *     summary: Create a new form
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Form created
 *       401:
 *         description: Unauthorized
 */
export async function GET() {
    const session = await getSession();
    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await createClient({ isAdmin: true });
    const { data } = await supabase
        .from("forms")
        .select("*")
        .eq("creator_id", session.id);
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const supabase = await createClient({ isAdmin: true });

    const { data, error } = await supabase
        .from("forms")
        .insert([{ ...body, creator_id: session.id, status: "DRAFT" }])
        .select()
        .single();

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}
