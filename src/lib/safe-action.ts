import { z } from "zod";

export type ActionState<T> = {
    data?: T;
    error?: string;
    success: boolean;
};

export function createSafeAction<TInput, TOutput>(
    schema: z.Schema<TInput>,
    action: (data: TInput) => Promise<TOutput>
) {
    return async (data: TInput): Promise<ActionState<TOutput>> => {
        try {
            const validatedData = schema.parse(data);
            const result = await action(validatedData);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            console.error("Server Action Error:", error);

            if (error instanceof z.ZodError) {
                return {
                    success: false,
                    error: error.issues.map((e) => e.message).join(", "),
                };
            }

            if (error instanceof Error) {
                return {
                    success: false,
                    error: error.message,
                };
            }

            return {
                success: false,
                error: "Ha ocurrido un error inesperado.",
            };
        }
    };
}
