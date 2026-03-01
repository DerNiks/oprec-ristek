"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function DashboardFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("q", term);
        } else {
            params.delete("q");
        }
        router.replace(`/?${params.toString()}`);
    }, 300); 

    const handleFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== "ALL") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.replace(`/?${params.toString()}`);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
                placeholder="Search forms..."
                className="w-full sm:w-75"
                defaultValue={searchParams.get("q")?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
            />

            <Select
                defaultValue={searchParams.get("status") || "ALL"}
                onValueChange={(val) => handleFilter("status", val)}
            >
                <SelectTrigger className="w-35">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
            </Select>

            <Select
                defaultValue={searchParams.get("sort") || "newest"}
                onValueChange={(val) => handleFilter("sort", val)}
            >
                <SelectTrigger className="w-35">
                    <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
