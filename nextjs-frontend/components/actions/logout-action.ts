"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutCurrentUser } from "@/lib/auth";

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  await logoutCurrentUser(token);
  cookieStore.delete("accessToken");
  redirect(`/login`);
}
