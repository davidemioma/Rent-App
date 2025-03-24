import { z } from "zod";

export const AuthSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }).trim(),
  email: z.optional(
    z.string().email({ message: "Invalid email format." }).trim()
  ),
  phonenumber: z.string(),
});

export type AuthValidator = z.infer<typeof AuthSchema>;
