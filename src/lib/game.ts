import { supabase } from './supabase'

export async function createGame(userId: string, amount: number) {
  if (!supabase) {
    console.error('Supabase is not configured')
    return null
  }

  const { data, error } = await supabase
    .from('games')
    .insert({
      player1: userId,
      bet_amount: amount,
      status: 'waiting'
    })
    .select()

  if (error) {
    console.error(error)
    return null
  }

  return data
}
