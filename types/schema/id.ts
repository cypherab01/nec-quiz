import { z } from "zod";

// Generic ID validator (length 25)
export const idSchema = z
  .string()
  .length(25, { message: "ID must be exactly 25 characters long" });
