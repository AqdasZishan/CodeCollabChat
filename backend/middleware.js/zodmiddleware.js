import { z } from "zod";

export const userSchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .email({ message: "Not a valid email" }),
  name: z.string({ required_error: "name is required" }),
  type: z.enum(["STUDENT", "TEACHER"], {
    required_error: "please select a valid user type",
  }),
  password: z
    .string({ required_error: "password is required" })
    .min(6, { message: "minimum 6 length of password is required" }),
});
export const userSignin = z.object({
  email: z
    .string({ required_error: "email is required" })
    .email({ message: "Not a valid email" }),
  password: z
    .string({ required_error: "password is rquired" })
    .min(6, { message: "minimum 6 length of password is required" }),
});

export const classSchema = z.object({
  name: z
    .string({ required_error: "classname is required" })
    .min(3, { message: "minimum length of room  should be 3" }),
});

export const projectSchema = z.object({
  name: z.string({ required_error: "name of project is require" }),
  classId: z.string({ required_error: "class id is required" }),
});
