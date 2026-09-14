import { z } from "zod";

const password = z.string().min(8, "Use at least 8 characters.").max(72, "Use 72 characters or fewer.").regex(/[A-Z]/, "Add one uppercase letter.").regex(/[a-z]/, "Add one lowercase letter.").regex(/[0-9]/, "Add one number.");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(80, "Use 80 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address.").max(160),
  password,
  confirmPassword: z.string(),
}).superRefine((value, context) => {
  if (value.password !== value.confirmPassword) context.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match." });
});

export const loginSchema = z.object({ email: z.string().trim().email("Enter a valid email address."), password: z.string().min(1, "Enter your password.") });

const eventFields = {
  title: z.string().trim().min(4, "Title must be at least 4 characters.").max(120, "Title must be 120 characters or fewer."),
  description: z.string().trim().min(20, "Description must be at least 20 characters.").max(5000, "Description must be 5000 characters or fewer."),
  location: z.string().trim().min(2, "Enter a location.").max(180, "Location must be 180 characters or fewer."),
  startDateTime: z.coerce.date({ invalid_type_error: "Enter a valid start date and time." }),
  endDateTime: z.coerce.date({ invalid_type_error: "Enter a valid end date and time." }),
  capacity: z.coerce.number({ invalid_type_error: "Capacity must be a number." }).int("Capacity must be a whole number.").positive("Capacity must be positive.").max(100000, "Capacity is too large."),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]),
  category: z.string().trim().max(80, "Category must be 80 characters or fewer.").optional().nullable(),
  imageUrl: z.string().url("Image URL must be valid.").max(1000).optional().nullable().or(z.literal("")),
};

export const eventSchema = z.object(eventFields).superRefine((value, context) => {
  if (value.endDateTime <= value.startDateTime) context.addIssue({ code: "custom", path: ["endDateTime"], message: "End time must be after start time." });
});

export const eventPatchSchema = z.object({ ...eventFields, status: eventFields.status.optional() }).partial();

export const feedbackSchema = z.object({ eventId: z.string().cuid(), rating: z.coerce.number().int().min(1).max(5), comment: z.string().trim().min(5).max(1000) });

export const profileSchema = z.object({ name: z.string().trim().min(2).max(80) });

export const registrationStatusSchema = z.object({
  status: z.enum(["ACTIVE", "CANCELLED", "ATTENDED", "NO_SHOW"]),
});
