import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente admin que ignora RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')

    if (!providerId) {
      return NextResponse.json({ error: 'providerId is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('availability')
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_active', true)
      .order('day_of_week')

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error getting availability:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { providerId, availability } = body

    if (!providerId || !availability) {
      return NextResponse.json({ error: 'providerId and availability are required' }, { status: 400 })
    }

    console.log('API: Creating availability with:', { providerId, availability })

    // Primeiro, remover todas as disponibilidades existentes
    const { error: deleteError } = await supabaseAdmin
      .from('availability')
      .delete()
      .eq('provider_id', providerId)

    if (deleteError) throw deleteError

    // Inserir novas disponibilidades
    const insertData = availability.map((avail: any) => ({
      provider_id: providerId,
      day_of_week: avail.day_of_week,
      start_time: avail.start_time,
      end_time: avail.end_time,
      is_active: true
    }))

    console.log('API: Insert data:', insertData)

    const { data, error } = await supabaseAdmin
      .from('availability')
      .insert(insertData)
      .select()

    if (error) throw error

    console.log('API: Availability created successfully:', data)

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API Error creating availability:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
