import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { hashPassword } from '../src/lib/auth/session';

// Manually parse .env.local if present
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

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required in .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

const INITIAL_LANDMARKS = [
  {
    place_name: 'Mount Fuji (富士山)',
    description: 'Japan’s most sacred active volcano and celebrated cultural UNESCO symbol standing at 3,776 meters.',
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
    starting_price: 35000,
    actual_worth: 75000,
  },
  {
    place_name: 'Fushimi Inari Taisha (伏見稲荷大社)',
    description: 'Kyoto’s legendary Shinto shrine renowned for its mesmerizing thousands of vibrant vermilion Torii gates climbing Mount Inari.',
    image_url: 'https://images.unsplash.com/photo-1478436127897-769e00d2c715?q=80&w=1200&auto=format&fit=crop',
    starting_price: 20000,
    actual_worth: 50000,
  },
  {
    place_name: 'Kinkaku-ji Golden Pavilion (金閣寺)',
    description: 'Exquisite Zen Buddhist temple in Kyoto with top two floors entirely covered in brilliant pure gold leaf, overlooking the mirror pond.',
    image_url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1200&auto=format&fit=crop',
    starting_price: 25000,
    actual_worth: 60000,
  },
  {
    place_name: 'Himeji Castle (姫路城)',
    description: 'The White Heron Castle, Japan’s largest and best-preserved feudal castle comprising an 83-room defensive network.',
    image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
    starting_price: 30000,
    actual_worth: 68000,
  },
  {
    place_name: 'Miyajima Itsukushima Shrine (厳島神社)',
    description: 'The iconic "Floating Torii Gate" in Hiroshima Bay appearing to drift weightlessly over the sea during high tide.',
    image_url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?q=80&w=1200&auto=format&fit=crop',
    starting_price: 22000,
    actual_worth: 52000,
  },
  {
    place_name: 'Arashiyama Sagano Bamboo Grove (嵐山竹林)',
    description: 'Ethereal emerald bamboo pathway in western Kyoto characterized by soaring stalks and rustling winds officially registered as one of Japan’s 100 Soundscapes.',
    image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
    starting_price: 15000,
    actual_worth: 38000,
  },
  {
    place_name: 'Shirakawa-go Historic Village (白川郷)',
    description: 'Picturesque mountain hamlet famous for steep thatched-roof farmhouses built in Gassho-zukuri (hands in prayer) architectural style.',
    image_url: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1200&auto=format&fit=crop',
    starting_price: 18000,
    actual_worth: 42000,
  },
  {
    place_name: 'Matsumoto Crow Castle (松本城)',
    description: 'One of Japan’s premier historic castles with distinctive black wood cladding and multi-tiered stone ramparts framed by the Northern Alps.',
    image_url: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?q=80&w=1200&auto=format&fit=crop',
    starting_price: 20000,
    actual_worth: 48000,
  },
  {
    place_name: 'Todai-ji Great Buddha Hall (東大寺)',
    description: 'Ancient Nara temple housing the world’s largest bronze statue of the Buddha Vairocana, within one of the largest wooden buildings on Earth.',
    image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1200&auto=format&fit=crop',
    starting_price: 24000,
    actual_worth: 55000,
  },
  {
    place_name: 'Sensō-ji Temple Asakusa (浅草寺)',
    description: 'Tokyo’s oldest Buddhist temple founded in 645 AD, approached through the celebrated Kaminarimon Thunder Gate with giant red lantern.',
    image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
    starting_price: 16000,
    actual_worth: 40000,
  },
];

async function seed() {
  console.log('🌸 Connecting to Supabase...');

  // 1. Event Settings
  console.log('🌸 Seeding initial Event Settings in Supabase...');
  const { data: existingSettings } = await supabase.from('event_settings').select('id').limit(1).maybeSingle();
  if (!existingSettings) {
    await supabase.from('event_settings').insert({
      event_name: 'Japanese Places Offline Auction 2026',
      starting_budget_per_team: 100000,
      currency: '₹',
      active_winning_rule: 'SAVINGS',
      is_registration_open: true,
      require_admin_approval: true,
      is_announcement_public: false,
    });
    console.log('✅ Event settings created (Default budget: ₹100,000)');
  }

  // 2. Admin Account
  console.log('🌸 Seeding Admin Account in Supabase...');
  const { data: existingAdmin } = await supabase.from('admins').select('id').eq('username', 'admin').maybeSingle();
  if (!existingAdmin) {
    const passwordHash = await hashPassword('Admin@Sakura2026!');
    await supabase.from('admins').insert({
      username: 'admin',
      password_hash: passwordHash,
      role: 'ADMIN',
    });
    console.log('✅ Admin initialized (admin / Admin@Sakura2026!)');
  }

  // 3. Landmarks
  console.log('🌸 Seeding Japanese Places Catalogue in Supabase...');
  for (const place of INITIAL_LANDMARKS) {
    const { data: exists } = await supabase.from('places').select('id').eq('place_name', place.place_name).maybeSingle();
    if (!exists) {
      await supabase.from('places').insert({
        ...place,
        status: 'NOT_SOLD',
      });
      console.log(`  + Seeded: ${place.place_name} (Starting: ₹${place.starting_price}, Worth: ₹${place.actual_worth})`);
    }
  }

  console.log('🎉 Supabase seeding completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
