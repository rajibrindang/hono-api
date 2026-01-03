import { z } from "zod";

export const createParticipatValidation = z.object({
  name: z.string().min(1),
  email: z.string().min(1),
  eventId: z.string().min(1),
});
