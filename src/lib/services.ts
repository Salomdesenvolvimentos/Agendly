import { supabase } from './supabase'
import { Service, ServiceFormData } from '@/types'

export async function createService(providerId: string, data: ServiceFormData) {
  try {
    console.log('Creating service with:', { providerId, data })
    
    const insertData = {
      provider_id: providerId,
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
      image: data.image || null,
      is_active: true,
    }
    
    console.log('Insert data:', insertData)
    
    const { data: service, error } = await supabase
      .from('services')
      .insert(insertData)
      .select()
      .single()

    console.log('Supabase response:', { service, error })

    if (error) {
      console.error('Supabase error details:', error)
      throw error
    }

    console.log('Service created successfully:', service)
    return { data: service, error: null }
  } catch (error) {
    console.error('Error creating service:', error)
    return { data: null, error: error as Error }
  }
}

export async function getServicesByProvider(providerId: string) {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error getting services:', error)
    return { data: null, error: error as Error }
  }
}

export async function getServiceById(serviceId: string) {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return { data, error: error as Error }
  } catch (error) {
    console.error('Error getting service by ID:', error)
    return { data: null, error: error as Error }
  }
}

export async function updateService(serviceId: string, data: Partial<ServiceFormData>) {
  try {
    const updateData: any = {}
    
    if (data.name) updateData.name = data.name
    if (data.description) updateData.description = data.description
    if (data.price) updateData.price = data.price
    if (data.duration) updateData.duration = data.duration
    if (data.image) updateData.image = data.image

    const { data: service, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', serviceId)
      .select()
      .single()

    if (error) throw error

    return { data: service, error: null }
  } catch (error) {
    console.error('Error updating service:', error)
    return { data: null, error: error as Error }
  }
}

export async function deleteService(serviceId: string) {
  try {
    const { error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', serviceId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error('Error deleting service:', error)
    return { error: error as Error }
  }
}
