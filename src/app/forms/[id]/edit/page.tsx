import Navbar from "@/common/navbar";
import { redirect } from "next/navigation";
import EditFormClient from "./_components/edit-form-client";
import FormEditHeader from "./_components/form-edit-header";
import { getFormById } from "@/app/actions/form";
import { getQuestions } from "@/app/actions/question";

export default async function EditFormPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const formId = resolvedParams.id;

    let form;
    let questions;

    try {
        const [formData, questionsData] = await Promise.all([
            getFormById(formId),
            getQuestions(formId),
        ]);

        form = formData;
        questions = questionsData;
    } catch (error) {
        console.error("Failed to fetch form data");
    }

    if (!form) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            <Navbar />
            <FormEditHeader form={form} />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl w-full">
                <EditFormClient
                    formId={form.id}
                    initialQuestions={questions || []}
                />
            </main>
        </div>
    );
}
