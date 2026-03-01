import { createClient } from "@/lib/supabase/server";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDistance } from "date-fns";

interface Answer {
    question_id: string;
    value: string;
}

interface Respondent {
    name: string;
    email: string;
}

interface SubmissionWithDetails {
    id: string;
    created_at: string;
    respondent_id: string;
    respondent: Respondent | null;
    answers: Answer[];
}

export default async function FormResponsesPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient({ isAdmin: true });

    const { data: form } = await supabase
        .from("forms")
        .select("title")
        .eq("id", id)
        .single();

    const { data: questions } = await supabase
        .from("questions")
        .select("id, text")
        .eq("form_id", id)
        .order("order");

    const { data: rawSubmissions } = await supabase
        .from("submissions")
        .select(
            `
            id,
            created_at,
            respondent_id,
            respondent:users (
                email,
                name
            ),
            answers (
                question_id,
                value
            )
        `,
        )
        .eq("form_id", id)
        .order("created_at", { ascending: false });

    if (!questions || !rawSubmissions) {
        return <div className="p-10 text-center">No data found</div>;
    }

    const submissions = rawSubmissions as unknown as SubmissionWithDetails[];

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">
                {form?.title || "Form"} - Responses
            </h1>

            <div className="border rounded-lg overflow-hidden shadow-sm bg-background">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-12.5">No</TableHead>
                            <TableHead className="w-37.5">
                                Submitted
                            </TableHead>

                            <TableHead className="w-62.5">
                                Respondent
                            </TableHead>

                            {questions.map((q) => (
                                <TableHead key={q.id} className="min-w-50">
                                    {q.text}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={questions.length + 3}
                                    className="text-center h-32 text-muted-foreground"
                                >
                                    No responses yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            submissions.map((sub, index) => {
                                const getAnswer = (qId: string) => {
                                    const answer = sub.answers.find(
                                        (a) => a.question_id === qId,
                                    );
                                    return answer ? answer.value : "-";
                                };

                                return (
                                    <TableRow key={sub.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            {formatDistance(
                                                new Date(sub.created_at),
                                                new Date(),
                                                {
                                                    addSuffix: true,
                                                },
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">
                                                    {sub.respondent?.name ||
                                                        "Unknown User"}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {sub.respondent?.email ||
                                                        "No email"}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {questions.map((q) => (
                                            <TableCell
                                                key={q.id}
                                                className="truncate max-w-75"
                                                title={getAnswer(q.id)}
                                            >
                                                {getAnswer(q.id)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
