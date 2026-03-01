export type formState = {
    status?: string;
    errors?: {
        _form?: string[];
    };
};

export type QuestionType =
    | "SHORT_ANSWER"
    | "MULTIPLE_CHOICE"
    | "CHECKBOX"
    | "DROPDOWN";

export interface Question {
    id: string;
    form_id: string;
    text: string;
    type: QuestionType;
    is_required: boolean;
    options: string[];
    order: number;
    created_at?: string;
    updated_at?: string;
}

export interface Form {
    id: string;
    title: string;
    description: string | null;
    status: "DRAFT" | "PUBLISHED" | "CLOSED";
    creator_id: string;
    created_at?: string;
    updated_at?: string;
}

export interface Answer {
    question_id: string;
    value: string;
}

export interface Submission {
    id: string;
    created_at: string;
    answers: Answer[];
}

declare module "swagger-ui-react/swagger-ui.css" {
    const content: string;
    export default content;
}
