"use client";

import { useState } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

interface FormInputProps<T extends FieldValues> {
    form: UseFormReturn<T>;
    name: Path<T>;
    label: string;
    placeholder?: string;
    type?: string;
    hideMessage?: boolean;
}

export default function FormInput<T extends FieldValues>({
    form,
    name,
    label,
    placeholder,
    type = "text",
    hideMessage = false,
}: FormInputProps<T>) {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === "password";

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Input
                                placeholder={placeholder}
                                type={
                                    isPasswordType && showPassword
                                        ? "text"
                                        : type
                                }
                                {...field}
                                value={field.value || ""}
                            />
                            {isPasswordType && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            )}
                        </div>
                    </FormControl>
                    {!hideMessage && <FormMessage />}
                </FormItem>
            )}
        />
    );
}
