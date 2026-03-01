import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async (): Promise<Record<string, unknown>> => {
    const spec = createSwaggerSpec({
        apiFolder: "src/app/api",
        definition: {
            openapi: "3.0.0",
            info: {
                title: "Form Builder API",
                version: "1.0",
                description:
                    "Dokumentasi API lengkap untuk Authentication, Forms, Questions, dan Submissions.",
            },
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
                },
                schemas: {
                    Form: {
                        type: "object",
                        properties: {
                            id: { type: "string", format: "uuid" },
                            title: { type: "string" },
                            description: { type: "string" },
                            status: {
                                type: "string",
                                enum: ["DRAFT", "PUBLISHED", "CLOSED"],
                            },
                            creator_id: { type: "string", format: "uuid" },
                            created_at: { type: "string", format: "date-time" },
                        },
                    },
                    Question: {
                        type: "object",
                        properties: {
                            id: { type: "string", format: "uuid" },
                            text: { type: "string" },
                            type: {
                                type: "string",
                                enum: [
                                    "SHORT_ANSWER",
                                    "MULTIPLE_CHOICE",
                                    "CHECKBOX",
                                    "DROPDOWN",
                                ],
                            },
                            is_required: { type: "boolean" },
                            options: {
                                type: "array",
                                items: { type: "string" },
                            },
                            order: { type: "integer" },
                        },
                    },
                    Error: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                        },
                    },
                },
            },
            security: [],
        },
    });
    return spec as Record<string, unknown>;
};
