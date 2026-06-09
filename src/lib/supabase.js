import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ozplvfteocoxmgivfdob.supabase.co'

const supabaseAnonKey = 'sb_publishable_4iBFTQnlEmF1vsblBsD66Q_vq7u0Km-'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)