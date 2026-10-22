import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

import { getSupabaseAdmin } from '../src/lib/supabase/admin';

async function main() {
  const supabase = getSupabaseAdmin();
  const tables = ['teams', 'team_members', 'places', 'purchases', 'event_settings', 'audit_logs', 'admins'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`❌ Table "${t}": ${error.message} (code: ${error.code})`);
    } else {
      console.log(`✅ Table "${t}": Available (${data.length} sample records found)`);
    }
  }
}

main().catch(console.error);
