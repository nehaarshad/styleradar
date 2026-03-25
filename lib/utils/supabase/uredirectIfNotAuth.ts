import { redirect } from "next/navigation";
import { createActionClient } from "./actions";

export async function redirectIfNotAuthenticated(path = '/login') {
  const supabase = await createActionClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    redirect(path);
  }

  return data.user;
}