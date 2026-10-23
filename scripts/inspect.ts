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
  
  const { data: teams } = await supabase.from('teams').select('id, team_name, username');
  console.log('--- TEAMS (' + (teams?.length || 0) + ') ---');
  teams?.forEach(t => console.log(`  Team: ${t.team_name} (username: ${t.username}, id: ${t.id})`));

  const { data: members } = await supabase.from('team_members').select('id, full_name, enrollment_number, team_id');
  console.log('--- TEAM MEMBERS (' + (members?.length || 0) + ') ---');
  members?.forEach(m => console.log(`  Member: ${m.full_name} (${m.enrollment_number})`));

  const { data: places } = await supabase.from('places').select('id, place_name, starting_price, actual_worth, status');
  console.log('--- PLACES (' + (places?.length || 0) + ') ---');
  places?.forEach(p => console.log(`  Place: ${p.place_name} [${p.status}] (starting: ${p.starting_price}, worth: ${p.actual_worth})`));

  const { data: purchases } = await supabase.from('purchases').select('id, place_name, team_name, final_purchase_price, status');
  console.log('--- PURCHASES (' + (purchases?.length || 0) + ') ---');
  purchases?.forEach(p => console.log(`  Purchase: ${p.place_name} by ${p.team_name} [${p.status}]`));

  const { data: auditLogs } = await supabase.from('audit_logs').select('id');
  console.log('--- AUDIT LOGS (' + (auditLogs?.length || 0) + ') ---');

  const { data: admins } = await supabase.from('admins').select('id, username, role');
  console.log('--- ADMINS (' + (admins?.length || 0) + ') ---');
  admins?.forEach(a => console.log(`  Admin: ${a.username} (${a.role})`));
}

main().catch(console.error);
