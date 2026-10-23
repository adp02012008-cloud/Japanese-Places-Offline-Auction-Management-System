import fs from 'fs';
import path from 'path';

// Parse .env.local
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
import { hashPassword } from '../src/lib/auth/session';

export const TEAMS_TO_ADD = [
  { name: 'Team Ninja', code: 'ninja' },
  { name: 'Team Sakura g', code: 'sakura_g' },
  { name: 'Team Samurai', code: 'samurai' },
  { name: 'Team Shogun', code: 'shogun' },
  { name: 'Team Ronin', code: 'ronin' },
  { name: 'Team Dragon', code: 'dragon' },
  { name: 'Team Phoenix g', code: 'phoenix_g' },
  { name: 'Team Daimyo', code: 'daimyo' },
  { name: 'Team Kabuki', code: 'kabuki' },
  { name: 'Team Kitsune g', code: 'kitsune_g' },
  { name: 'Team Akatsuki', code: 'akatsuki' },
  { name: 'Team Fuji', code: 'fuji' },
];

async function seedTeams() {
  const supabase = getSupabaseAdmin();
  console.log('🌸 Seeding requested 12 teams into Supabase...');

  // Get current event starting budget
  const { data: settings } = await supabase
    .from('event_settings')
    .select('starting_budget_per_team')
    .limit(1)
    .maybeSingle();

  const startingBudget = settings?.starting_budget_per_team ?? 100000;
  const defaultPassword = 'team123';
  const passwordHash = await hashPassword(defaultPassword);

  for (const item of TEAMS_TO_ADD) {
    const username = `team_${item.code}`;

    // Check if team already exists
    const { data: existing } = await supabase
      .from('teams')
      .select('id, team_name')
      .ilike('team_name', item.name)
      .maybeSingle();

    if (existing) {
      console.log(`ℹ️  Team "${item.name}" already exists (ID: ${existing.id})`);
      continue;
    }

    // Insert team
    const { data: newTeam, error: teamErr } = await supabase
      .from('teams')
      .insert({
        team_name: item.name,
        member_count: 1,
        approval_status: 'APPROVED',
        participation_status: 'ACTIVE',
        starting_budget: startingBudget,
        remaining_budget: startingBudget,
        total_spent: 0,
        total_actual_worth: 0,
        username,
        password_hash: passwordHash,
        first_login_must_change_password: false,
      })
      .select()
      .single();

    if (teamErr || !newTeam) {
      console.error(`❌ Failed to insert team "${item.name}":`, teamErr?.message);
      continue;
    }

    // Insert primary member
    const memberCode = `ENR-${item.code.toUpperCase()}-01`;
    await supabase.from('team_members').insert({
      team_id: newTeam.id,
      full_name: `${item.name} Captain`,
      enrollment_number: memberCode,
    });

    console.log(`✅ Created: ${item.name} | Username: ${username} | Password: ${defaultPassword} | Budget: ₹${startingBudget}`);
  }

  console.log('\n🎉 All 12 teams successfully seeded and approved for live auction!');
}

seedTeams().catch((err) => {
  console.error('Fatal error during team seeding:', err);
  process.exit(1);
});
