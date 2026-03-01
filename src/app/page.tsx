import Navbar from "@/common/navbar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { FileText, Plus, Settings, BarChart } from "lucide-react";
import Link from "next/link";
import { getForms } from "./actions/form";
import DeleteFormButton from "./_components/delete-form-button";
import DashboardFilters from "./_components/dashboard-filters";

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string; sort?: string }>;
}) {
    const params = await searchParams;
    const query = params.q || "";
    const status = params.status || "";
    const sort = params.sort || "";
    const forms = await getForms(query, status, sort);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-taupe-950 flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            My Forms
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Manage your forms, view responses, and edit
                            configurations.
                        </p>
                    </div>
                    <Button asChild className="shrink-0">
                        <Link href="/forms/create">
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Form
                        </Link>
                    </Button>
                </div>

                <DashboardFilters />

                {forms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed rounded-xl bg-background text-center">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <FileText className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold tracking-tight mb-2">
                            No forms created yet
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            You haven`&apos;`t created any forms. Get started by
                            building your first form to collect responses.
                        </p>
                        <Button asChild>
                            <Link href="/forms/create">
                                <Plus className="w-4 h-4 mr-2" />
                                Create First Form
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {forms.map((form) => (
                            <Card
                                key={form.id}
                                className="group flex flex-col hover:shadow-md transition-all duration-200"
                            >
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <span
                                            className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                                                form.status === "PUBLISHED"
                                                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                                                    : form.status === "CLOSED"
                                                      ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"
                                                      : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
                                            }`}
                                        >
                                            {form.status}
                                        </span>
                                        <DeleteFormButton formId={form.id} />
                                    </div>
                                    <CardTitle className="line-clamp-1 text-xl">
                                        {form.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 h-10 mt-2">
                                        {form.description ||
                                            "No description provided."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="text-xs text-muted-foreground">
                                        Created on{" "}
                                        {new Date(
                                            form.created_at,
                                        ).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-4 border-t gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        asChild
                                    >
                                        <Link href={`/forms/${form.id}/edit`}>
                                            <Settings className="w-4 h-4 mr-2" />{" "}
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="flex-1"
                                        asChild
                                    >
                                        <Link
                                            href={`/forms/${form.id}/responses`}
                                        >
                                            <BarChart className="w-4 h-4 mr-2" />{" "}
                                            Results
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
