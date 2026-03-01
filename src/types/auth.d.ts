export type AuthFormState = {
    status?: string;
    errors?: {
        email?: string[];
        password?: string[];
        name?: string[];
        _form?: string[];
    };
};
