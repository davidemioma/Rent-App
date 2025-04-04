import { z } from "zod";

export const ApplicationSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }).trim(),
  email: z.string().email({ message: "Invalid email format." }).trim(),
  phoneNumber: z
    .string()
    .trim()
    .min(11, {
      message:
        "Invalid phone number, don't forget to add your country code (1.e +44)",
    })
    .max(13, {
      message:
        "Invalid phone number, don't forget to add your country code (1.e +44)",
    }),
  message: z.optional(z.string()),
});

export type ApplicationValidator = z.infer<typeof ApplicationSchema>;
