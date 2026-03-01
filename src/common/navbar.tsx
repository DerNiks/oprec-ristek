import Link from "next/link";
import { LogOut, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { DarkModeToggle } from "./darkmode-toggle";
import { logout } from "@/app/actions/auth";

export default async function Navbar() {
    const session = await getSession();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                <Link
                    href="/"
                    className="flex items-center space-x-2 transition-opacity hover:opacity-80"
                >
                    <LayoutTemplate className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg tracking-tight">
                        FormuLac
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    {session && (
                        <span className="text-sm text-muted-foreground hidden sm:inline-block">
                            Hi,{" "}
                            <strong className="text-foreground">
                                {session.name}
                            </strong>
                        </span>
                    )}

                    <DarkModeToggle />

                    {session && (
                        <form action={logout}>
                            <Button
                                variant="ghost"
                                size="sm"
                                type="submit"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </header>
    );
}
