// Storage helpers using Supabase Storage
// Falls back to Manus storage proxy if Supabase credentials are not available

import { createClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'erp-files';

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for storage");
  }
  return createClient(url, key);
}

async function ensureBucket() {
  const supabase = getSupabaseClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === BUCKET_NAME);
  if (!exists) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    });
  }
}

let bucketReady = false;

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseClient();
  
  if (!bucketReady) {
    await ensureBucket();
    bucketReady = true;
  }
  
  const key = relKey.replace(/^\/+/, "");
  
  // Convert string to Uint8Array if needed
  let fileData: Uint8Array | Buffer;
  if (typeof data === "string") {
    fileData = new TextEncoder().encode(data);
  } else {
    fileData = data;
  }
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(key, fileData, {
      contentType,
      upsert: true,
    });
  
  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }
  
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(key);
  
  return { key, url: urlData.publicUrl };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseClient();
  const key = relKey.replace(/^\/+/, "");
  
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(key);
  
  return { key, url: urlData.publicUrl };
}

export async function storageDelete(relKey: string): Promise<void> {
  const supabase = getSupabaseClient();
  const key = relKey.replace(/^\/+/, "");
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([key]);
  
  if (error) {
    console.warn(`Storage delete failed for ${key}: ${error.message}`);
  }
}
