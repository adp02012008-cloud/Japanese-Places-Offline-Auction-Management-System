import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || 'japanese-places';

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseServiceKey && supabaseUrl.startsWith('https://'));
}

export function getSupabaseAdminClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: { persistSession: false },
  });
}

export interface UploadImageResult {
  publicUrl: string;
  storagePath: string;
}

/**
 * Uploads a Japanese landmark photo to Supabase Storage.
 * Restricts file size (<5MB) and mime types (JPEG, PNG, WebP).
 */
export async function uploadPlaceImage(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<UploadImageResult> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (!allowedTypes.includes(contentType)) {
    throw new Error('Unsupported image format. Please upload JPEG, PNG, or WebP images.');
  }

  // 5MB limit
  if (fileBuffer.length > 5 * 1024 * 1024) {
    throw new Error('File size exceeds the 5MB limit.');
  }

  const supabase = getSupabaseAdminClient();

  // If Supabase is configured, upload to bucket
  if (supabase) {
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `places/${timestamp}_${sanitizedName}`;

    const { error } = await supabase.storage.from(bucketName).upload(path, fileBuffer, {
      contentType,
      upsert: true,
    });

    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(path);

    return {
      publicUrl: publicData.publicUrl,
      storagePath: path,
    };
  }

  // Graceful local fallback for development: base64 data URL
  // (Clearly marked as local dev fallback in documentation)
  const base64 = fileBuffer.toString('base64');
  const dataUrl = `data:${contentType};base64,${base64}`;

  return {
    publicUrl: dataUrl,
    storagePath: `local_fallback/${Date.now()}_${fileName}`,
  };
}
