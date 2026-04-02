import { supabase } from './supabase'
import { User } from '@/types'

export async function signUp(email: string, password: string, name: string, role: 'provider' | 'customer') {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error signing up:', error)
    return { data: null, error: error as Error }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error signing in:', error)
    return { data: null, error: error as Error }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error signing out:', error)
    return { error: error as Error }
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error resetting password:', error)
    return { error: error as Error }
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error updating password:', error)
    return { error: error as Error }
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    // Retornar dados básicos do usuário sem buscar na tabela users
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || '',
      role: user.user_metadata?.role || 'customer',
      created_at: user.created_at,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function updateUserProfile(name: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not found')

    // Atualizar na tabela users
    const { error } = await supabase
      .from('users')
      .update({ name })
      .eq('id', user.id)

    if (error) throw error

    // Atualizar metadados do auth
    const { error: authError } = await supabase.auth.updateUser({
      data: { name },
    })

    if (authError) throw authError

    return { error: null }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return { error: error as Error }
  }
}

export async function onAuthStateChange(callback: (user: User | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        const user = await getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    }
  )

  return subscription
}
