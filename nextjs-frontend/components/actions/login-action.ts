"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/definitions";
import { loginWithPassword } from "@/lib/auth";

export async function login(prevState: unknown, formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { username, password } = validatedFields.data;

  const input = {
    body: {
      username,
      password,
    },
  };

  try {
    const result = await loginWithPassword(input.body);
    if (!result.ok) {
      return { server_validation_error: result.message };
    }

    const accessToken = result.data?.access_token;
    if (typeof accessToken !== "string") {
      return { server_error: "Token login tidak valid." };
    }

    const cookieStore = await cookies();
    cookieStore.set("accessToken", accessToken, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    });
  } catch (err) {
    console.error("Login error:", err);
    return {
      server_error: "An unexpected error occurred. Please try again later.",
    };
  }
  redirect("/dashboard");
}
