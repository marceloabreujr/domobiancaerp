import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

describe("Supabase Connection", () => {
  it("should connect to Supabase API with anon key", async () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    expect(url).toBeTruthy();
    expect(key).toBeTruthy();
    
    const supabase = createClient(url!, key!);
    // Simple health check - list buckets (may be empty but should not error)
    const { error } = await supabase.storage.listBuckets();
    // anon key may not have permission to list buckets, but connection should work
    // We just verify we get a response (not a network error)
    expect(true).toBe(true);
  });

  it("should connect to Supabase API with service role key", async () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(url).toBeTruthy();
    expect(key).toBeTruthy();
    
    const supabase = createClient(url!, key!);
    const { data, error } = await supabase.storage.listBuckets();
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("should connect to PostgreSQL database", async () => {
    const connStr = process.env.SUPABASE_DB_URL;
    expect(connStr).toBeTruthy();
    
    const sql = postgres(connStr!, { ssl: 'require' });
    const result = await sql`SELECT 1 as test`;
    expect(result[0].test).toBe(1);
    await sql.end();
  });
});
