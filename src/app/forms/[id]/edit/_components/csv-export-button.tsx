"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Question, Submission } from "@/types/general";
import { toast } from "sonner";

interface CsvExportButtonProps {
    data: Submission[];
    questions: Question[];
    filename?: string;
}

export default function CsvExportButton({
    data,
    questions,
    filename = "responses.csv",
}: CsvExportButtonProps) {
    const handleDownload = () => {
        try {
            if (!data || data.length === 0) {
                toast.error("No data to export");
                return;
            }

            const headers = [
                "Submitted At",
                ...questions.map((q) => `"${q.text.replace(/"/g, '""')}"`),
            ];

            const rows = data.map((sub) => {
                const date = new Date(sub.created_at).toLocaleString();

                const answers = questions.map((q) => {
                    const answerObj = sub.answers.find(
                        (a) => a.question_id === q.id,
                    );
                    let val = answerObj ? answerObj.value : "";
                    val = val.replace(/"/g, '""').replace(/\n/g, " ");
                    return `"${val}"`;
                });

                return [date, ...answers].join(",");
            });

            const csvContent = [headers.join(","), ...rows].join("\n");

            const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("CSV Exported successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to export CSV");
        }
    };

    return (
        <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Export to CSV
        </Button>
    );
}
