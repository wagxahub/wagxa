import { supabase } from "./supabase";

export async function signUp(email: string, password: string) {
  if (!supabase) {
    return {
      data: null,
      error: { message: "Supabase is not configured" }
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("SIGNUP ERROR:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function signIn(email: string, password: string) {
  if (!supabase) {
    return {
      data: null,
      error: { message: "Supabase is not configured" }
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("LOGIN ERROR:", error);
    return { data: null, error };
  }

  return { data, error: null };
}
