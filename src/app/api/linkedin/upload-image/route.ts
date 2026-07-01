import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { imageDataUrl } = await req.json()

  if (!imageDataUrl?.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('linkedin_access_token, linkedin_token_expires_at, linkedin_author_urn')
    .eq('id', user.id)
    .single()

  if (!profile?.linkedin_access_token) {
    return NextResponse.json({ error: 'LinkedIn not connected' }, { status: 403 })
  }

  if (profile.linkedin_token_expires_at && new Date(profile.linkedin_token_expires_at) < new Date()) {
    return NextResponse.json({ error: 'LinkedIn token expired — reconnect in Account' }, { status: 403 })
  }

  // Convert data URL to buffer
  const base64 = imageDataUrl.split(',')[1]
  const buffer = Buffer.from(base64, 'base64')

  // Step 1: Register the upload with LinkedIn
  const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${profile.linkedin_access_token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        owner: profile.linkedin_author_urn,
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        serviceRelationships: [{
          identifier: 'urn:li:userGeneratedContent',
          relationshipType: 'OWNER',
        }],
      },
    }),
  })

  if (!registerRes.ok) {
    const err = await registerRes.text()
    console.error('LinkedIn register upload error:', err)
    return NextResponse.json({ error: 'Failed to register image upload' }, { status: 502 })
  }

  const registerData = await registerRes.json()
  const uploadUrl = registerData.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl
  const mediaUrn  = registerData.value?.asset

  if (!uploadUrl || !mediaUrn) {
    console.error('LinkedIn register response missing uploadUrl or asset:', registerData)
    return NextResponse.json({ error: 'Invalid register upload response' }, { status: 502 })
  }

  // Step 2: PUT the image binary to the returned upload URL
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: buffer,
  })

  if (!uploadRes.ok) {
    const err = await uploadRes.text()
    console.error('LinkedIn image PUT error:', err)
    return NextResponse.json({ error: 'Failed to upload image binary' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, mediaUrn })
}
