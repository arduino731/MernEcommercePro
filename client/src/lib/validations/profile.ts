import { z } from "zod";

export const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  address: z.string().min(5, { message: 'Address must be at least 5 characters' }).optional(),
  city: z.string().min(2, { message: 'City must be at least 2 characters' }).optional(),
  state: z.string().min(2, { message: 'State must be at least 2 characters' }).optional(),
  postalCode: z.string().min(5, { message: 'Postal code must be at least 5 characters' }).optional(),
  country: z.string().min(2, { message: 'Country must be at least 2 characters' }).optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
