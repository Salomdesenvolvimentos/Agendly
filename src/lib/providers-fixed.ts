import { supabase } from './supabase'
import { Provider, ProviderFormData } from '@/types'

export async function getProviderByUserId(userId: string) {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Se nao encontrar provider, retorna null sem tratar como erro
    if (error && error.code === 'PGRST116') {
      return { data: null, error: null }
    }

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error getting provider:', error)
    return { data: null, error: error as Error }
  }
}
