import { supabase } from './supabaseClient'

// Sign In Function
export const handleLogin = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    if (error) {
      return { data: null, error: new Error(error.message) }
    }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Failed to fetch') }
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
      console.error('SignUp error:', error);
      return { data: null, error: new Error(error.message) }
    }
    
    console.log('SignUp success:', data);
    // Return data even if null (Supabase returns null when email confirmation is required)
    return { data: data || null, error: null }
  } catch (error) {
    console.error('SignUp catch error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Failed to fetch') }
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
