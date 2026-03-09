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
    console.log("DATA:", data);
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Failed to fetch') }
  }
}

// Sign Up Function (For new accounts)
export const handleSignUp = async (email: string, password: string, username: string) => {
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username, 
          rating: 1000,
        }
      }
    });

    if (signUpError) {
      console.error('SignUp error:', signUpError);
      return { data: null, error: new Error(signUpError.message) };
    }

    console.log('SignUp success:', signUpData);
    return { data: signUpData || null, error: null };
  } catch (error) {
    console.error('SignUp catch error:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Failed to fetch') };
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
