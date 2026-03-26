import { redirect } from "next/navigation";
import { supabase } from "./client";

export async function redirectIfNotAuthenticated(path = '/login') {
 
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    redirect(path);
  }

  return data.user;
}