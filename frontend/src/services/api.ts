import { supabase } from './supabaseClient'

// Sign In Function
export const handleLogin = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    if (error) {
      throw new Error(error.message)
    }
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Sign Up Function (For new accounts)
export const handleSignUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })
    if (error) {
      throw new Error(error.message)
    }
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Sign Out Function
export const handleSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
    return { error: null }
  } catch (error) {
    return { error }
  }
}