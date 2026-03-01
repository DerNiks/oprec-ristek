import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

interface SubmissionItem {
    questionId: string;
    value: string;
}

/**
 * @swagger
 * /api/forms/{id}/submit:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags: [Submissions]
 *     summary: Submit a response to a form
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 questionId:
 *                   type: string
 *                 value:
 *                   type: string
 *     responses:
 *       200:
 *         description: Submission successful
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getSession();
    if (!session)
        return NextResponse.json(
            { error: "Must be logged in" },
            { status: 401 },
        );

    const { id } = await params;

    const rawBody = await request.json();
    const answers = rawBody as SubmissionItem[];

    const supabase = await createClient({ isAdmin: true });

    const { data: submission, error: subError } = await supabase
        .from("submissions")
        .insert([{ form_id: id, respondent_id: session.id }])
        .select()
        .single();

    if (subError)
        return NextResponse.json({ error: subError.message }, { status: 400 });

    const answersData = answers.map((a) => ({
        submission_id: submission.id,
        question_id: a.questionId,
        value: a.value,
    }));

    const { error: ansError } = await supabase
        .from("answers")
        .insert(answersData);
    if (ansError)
        return NextResponse.json({ error: ansError.message }, { status: 500 });

    return NextResponse.json({ message: "Submitted successfully" });
}
