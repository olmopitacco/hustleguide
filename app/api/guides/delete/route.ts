import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { guideId } = await request.json()
    if (!guideId) return Response.json({ error: 'guideId required' }, { status: 400 })

    // Verify ownership before deleting
    const { data: guide } = await supabase
      .from('generated_guides')
      .select('id')
      .eq('id', guideId)
      .eq('user_id', user.id)
      .single()

    if (!guide) return Response.json({ error: 'Guide not found' }, { status: 404 })

    // Delete checkins first (FK constraint — cascade may not be set)
    await supabase.from('weekly_checkins').delete().eq('guide_id', guideId)

    // Delete the guide
    const { error } = await supabase
      .from('generated_guides')
      .delete()
      .eq('id', guideId)
      .eq('user_id', user.id)

    if (error) {
      console.error('[delete-guide] delete failed:', error.message)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ deleted: true })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
