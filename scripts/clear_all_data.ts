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

async function clearAllData() {
  const supabase = getSupabaseAdmin();
  console.log('🧹 Starting thorough data purge...');

  // 1. Delete all purchases
  console.log('1. Clearing purchases ledger...');
  const { error: purchasesErr, count: purchasesCount } = await supabase
    .from('purchases')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (purchasesErr) {
    console.error('❌ Error clearing purchases:', purchasesErr);
  } else {
    console.log(`✅ Cleared ${purchasesCount ?? 'all'} purchases.`);
  }

  // 2. Delete all team members
  console.log('2. Clearing team members...');
  const { error: membersErr, count: membersCount } = await supabase
    .from('team_members')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (membersErr) {
    console.error('❌ Error clearing team members:', membersErr);
  } else {
    console.log(`✅ Cleared ${membersCount ?? 'all'} team members.`);
  }

  // 3. Delete all teams (users)
  console.log('3. Clearing teams & user credentials...');
  const { error: teamsErr, count: teamsCount } = await supabase
    .from('teams')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (teamsErr) {
    console.error('❌ Error clearing teams:', teamsErr);
  } else {
    console.log(`✅ Cleared ${teamsCount ?? 'all'} teams/users.`);
  }

  // 4. Delete all places (landmarks, names, descriptions)
  console.log('4. Clearing Japanese places, names, and descriptions...');
  const { error: placesErr, count: placesCount } = await supabase
    .from('places')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (placesErr) {
    console.error('❌ Error clearing places:', placesErr);
  } else {
    console.log(`✅ Cleared ${placesCount ?? 'all'} places.`);
  }

  // 5. Delete all audit logs
  console.log('5. Clearing audit logs...');
  const { error: auditErr, count: auditCount } = await supabase
    .from('audit_logs')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (auditErr) {
    console.error('❌ Error clearing audit logs:', auditErr);
  } else {
    console.log(`✅ Cleared ${auditCount ?? 'all'} audit logs.`);
  }

  // 6. Reset event settings (turn off public announcement, reset defaults)
  console.log('6. Resetting event settings...');
  const { error: settingsErr } = await supabase
    .from('event_settings')
    .update({
      is_announcement_public: false,
      is_registration_open: true,
      require_admin_approval: true,
      starting_budget_per_team: 100000,
      currency: '₹',
      active_winning_rule: 'SAVINGS',
    })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (settingsErr) {
    console.error('❌ Error resetting event settings:', settingsErr);
  } else {
    console.log('✅ Event settings reset to fresh defaults.');
  }

  // 7. Clean storage bucket if any files exist
  try {
    const { data: files } = await supabase.storage.from('japanese-places').list();
    if (files && files.length > 0) {
      const pathsToDelete = files.map((f) => f.name).filter(Boolean);
      if (pathsToDelete.length > 0) {
        console.log(`7. Removing ${pathsToDelete.length} images from storage bucket...`);
        await supabase.storage.from('japanese-places').remove(pathsToDelete);
        console.log('✅ Storage bucket cleaned.');
      }
    } else {
      console.log('7. Storage bucket has no extra files.');
    }
  } catch (storageErr) {
    console.log('Storage cleanup note:', storageErr);
  }

  console.log('\n✨ Database purge completed successfully! All users, teams, places, descriptions and default data have been removed.');
}

clearAllData().catch((err) => {
  console.error('Fatal error during purge:', err);
  process.exit(1);
});
