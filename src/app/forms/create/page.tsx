import Navbar from "@/common/navbar";
import CreateFormClient from "./_components/create-form-client";

export default function CreateFormPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-taupe-950 flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                <CreateFormClient />
            </main>
        </div>
    );
}
