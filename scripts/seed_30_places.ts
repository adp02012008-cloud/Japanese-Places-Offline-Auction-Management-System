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

export const PLACES_30 = [
  // 1 - 10: Starting Bid = ¥3,000,000
  {
    order: 1,
    place_name: 'Tokyo',
    actual_worth: 10000000,
    starting_price: 3000000,
    description: 'Japan’s dazzling hyper-modern metropolis blending neon skyscrapers, historic shrines, bustling Shibuya crossings, and imperial gardens.',
    image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 2,
    place_name: 'Osaka',
    actual_worth: 9500000,
    starting_price: 3000000,
    description: 'The nation’s culinary kitchen and commerce hub, famous for lively Dotonbori canals, glowing Glico running man, and grand Osaka Castle.',
    image_url: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 3,
    place_name: 'Kyoto',
    actual_worth: 9000000,
    starting_price: 3000000,
    description: 'The millennial imperial capital of Japan, housing classical wooden temples, pure gold pavilions, geisha quarters, and peaceful Zen rock sanctuaries.',
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 4,
    place_name: 'Yokohama',
    actual_worth: 8500000,
    starting_price: 3000000,
    description: 'Cosmopolitan bayside port city celebrated for its futuristic Minato Mirai 21 waterfront skyline, sea towers, and Japan’s largest Chinatown.',
    image_url: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 5,
    place_name: 'Nagoya',
    actual_worth: 8000000,
    starting_price: 3000000,
    description: 'Industrial powerhouse with samurai lineage, centered on the golden shachihoko-crowned Nagoya Castle and Atsuta Grand Shrine.',
    image_url: 'https://images.unsplash.com/photo-1554797589-7241bb691973?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 6,
    place_name: 'Fukuoka',
    actual_worth: 7500000,
    starting_price: 3000000,
    description: 'Thriving southern gateway on Hakata Bay, world-famous for its evening open-air yatai food stalls, tonkotsu ramen culture, and beachside parks.',
    image_url: 'https://images.unsplash.com/photo-1578637387939-43c525550085?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 7,
    place_name: 'Kobe',
    actual_worth: 7000000,
    starting_price: 3000000,
    description: 'Picturesque harbor town between Mount Rokko and the sea, famed for historic Western residences, scenic cableways, and prime wagyu beef.',
    image_url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 8,
    place_name: 'Sapporo',
    actual_worth: 6800000,
    starting_price: 3000000,
    description: 'Northern snow capital of Hokkaido, celebrated for massive carved ice festivals, sprawling green boulevards, winter resorts, and rich miso ramen.',
    image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 9,
    place_name: 'Hiroshima',
    actual_worth: 6500000,
    starting_price: 3000000,
    description: 'Inspiring international city of peace on the Seto Inland Sea, adjacent to sacred Miyajima Island and the floating vermilion Torii gate.',
    image_url: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 10,
    place_name: 'Nara',
    actual_worth: 6200000,
    starting_price: 3000000,
    description: 'Japan’s 8th-century sanctuary where thousands of sacred wild sika deer bow to visitors around the colossal Bronze Buddha of Todai-ji.',
    image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1200&auto=format&fit=crop',
  },

  // 11 - 20: Starting Bid = ¥2,000,000
  {
    order: 11,
    place_name: 'Sendai',
    actual_worth: 5900000,
    starting_price: 2000000,
    description: 'The "City of Trees" in Tohoku founded by the legendary one-eyed dragon samurai Date Masamune, lined with lush zelkova-shaded avenues.',
    image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 12,
    place_name: 'Kanazawa',
    actual_worth: 5600000,
    starting_price: 2000000,
    description: 'Artistic castle citadel on the Sea of Japan, featuring pristine samurai quarters, Higashi Chaya geisha districts, and Kenroku-en landscape garden.',
    image_url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 13,
    place_name: 'Nagasaki',
    actual_worth: 5300000,
    starting_price: 2000000,
    description: 'Dramatic terraced harbor city on Kyushu with four centuries of European and Chinese trade culture, night ropeways, and Peace Park monuments.',
    image_url: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 14,
    place_name: 'Kamakura',
    actual_worth: 5000000,
    starting_price: 2000000,
    description: 'Atmospheric coastal home of Japan’s first shogunate, acclaimed for the Great Outdoor Amida Buddha, hydrangea paths, and forested Zen trails.',
    image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 15,
    place_name: 'Hakodate',
    actual_worth: 4800000,
    starting_price: 2000000,
    description: 'Stunning Hokkaido port celebrated for Mount Hakodate’s three-star million-dollar night vista, morning fish markets, and star-shaped Goryokaku fort.',
    image_url: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 16,
    place_name: 'Himeji',
    actual_worth: 4600000,
    starting_price: 2000000,
    description: 'Crown jewel of feudal fortress architecture, housing Himeji Castle ("White Heron"), Japan’s largest and best-preserved national treasure stronghold.',
    image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 17,
    place_name: 'Shizuoka',
    actual_worth: 4400000,
    starting_price: 2000000,
    description: 'Lush coastal prefecture nestled directly at the foot of Mount Fuji, world-famous for terraced emerald green tea plantations and Suruga Bay.',
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 18,
    place_name: 'Kumamoto',
    actual_worth: 4200000,
    starting_price: 2000000,
    description: 'Formidable warrior city on Kyushu dominated by the colossal curved stone ramparts (mushagaeshi) and majestic keeps of Kumamoto Castle.',
    image_url: 'https://images.unsplash.com/photo-1554797589-7241bb691973?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 19,
    place_name: 'Kagoshima',
    actual_worth: 4000000,
    starting_price: 2000000,
    description: 'The sunny "Naples of Japan", set across a crystalline deep blue bay overlooking the dramatic active plume of Sakurajima volcano.',
    image_url: 'https://images.unsplash.com/photo-1578637387939-43c525550085?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 20,
    place_name: 'Okayama',
    actual_worth: 3800000,
    starting_price: 2000000,
    description: 'The "Land of Sunshine", famous for the exquisite Koraku-en stroll garden, black Crow Castle, and the heroic peach-boy folklore of Momotaro.',
    image_url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?q=80&w=1200&auto=format&fit=crop',
  },

  // 21 - 30: Starting Bid = ¥1,000,000
  {
    order: 21,
    place_name: 'Niigata',
    actual_worth: 3600000,
    starting_price: 1000000,
    description: 'Coastal snow country capital along the Shinano River, acclaimed worldwide for Japan’s finest Koshihikari rice and pure artisanal sake breweries.',
    image_url: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 22,
    place_name: 'Matsumoto',
    actual_worth: 3400000,
    starting_price: 1000000,
    description: 'Breathtaking alpine stronghold framed by the Japanese Alps, preserving its original 16th-century five-tier black wooden Crow Castle keep.',
    image_url: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 23,
    place_name: 'Matsuyama',
    actual_worth: 3200000,
    starting_price: 1000000,
    description: 'Historic Shikoku castle city featuring the soaring hilltop keep of Matsuyama Castle and Dogo Onsen, Japan’s 3,000-year-old healing hot spring.',
    image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 24,
    place_name: 'Naha',
    actual_worth: 3000000,
    starting_price: 1000000,
    description: 'Vibrant sub-tropical capital of Okinawa, rich in ancient Ryukyu Kingdom royal heritage, red-tiled Shuri architecture, and turquoise ocean reef views.',
    image_url: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 25,
    place_name: 'Takayama',
    actual_worth: 2800000,
    starting_price: 1000000,
    description: 'Enchanting Edo-period mountain hamlet in the Hida highlands, celebrated for dark wooden lattice merchant houses, sake casks, and ornate festival floats.',
    image_url: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 26,
    place_name: 'Otaru',
    actual_worth: 2600000,
    starting_price: 1000000,
    description: 'Romantic Hokkaido port city with a stone-lined canal illuminated by Victorian oil lamps, converted red-brick warehouses, glassworks, and music boxes.',
    image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 27,
    place_name: 'Beppu',
    actual_worth: 2400000,
    starting_price: 1000000,
    description: 'Japan’s premier geothermal wonderland in Oita, blanketed in billowing thermal steam plumes and home to the famous eight multi-colored "Hells" springs.',
    image_url: 'https://images.unsplash.com/photo-1554797589-7241bb691973?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 28,
    place_name: 'Toyama',
    actual_worth: 2200000,
    starting_price: 1000000,
    description: 'Scenic coastal haven on Toyama Bay, framed by the towering 3,000-meter snowcapped Tateyama peaks and renowned for luminescent firefly squid.',
    image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 29,
    place_name: 'Nikko',
    actual_worth: 2000000,
    starting_price: 1000000,
    description: 'Sacred mountain sanctuary in Tochigi, enshrining Shogun Tokugawa Ieyasu within the world-famous gold-gilded, intricate wood carvings of Toshogu.',
    image_url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1200&auto=format&fit=crop',
  },
  {
    order: 30,
    place_name: 'Takamatsu',
    actual_worth: 1800000,
    starting_price: 1000000,
    description: 'Northern gateway to Shikoku on the calm Inland Sea, home to the sprawling 400-year-old Ritsurin daimyo garden and authentic Sanuki udon.',
    image_url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?q=80&w=1200&auto=format&fit=crop',
  },
];

async function seedPlaces() {
  const supabase = getSupabaseAdmin();
  console.log('🌸 Seeding 30 Japanese Places into Supabase...');

  // 1. Update event settings currency to ¥ and set starting budget appropriately (e.g. ¥20,000,000)
  const defaultTeamBudget = 20000000;
  await supabase
    .from('event_settings')
    .update({
      currency: '¥',
      starting_budget_per_team: defaultTeamBudget,
    })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ Updated event settings: currency set to ¥, default budget set to ¥20,000,000');

  // 2. Also update all existing teams to have adequate budget for this scale (¥20,000,000)
  await supabase
    .from('teams')
    .update({
      starting_budget: defaultTeamBudget,
      remaining_budget: defaultTeamBudget,
    })
    .eq('total_spent', 0);
  console.log('✅ Synchronized team budgets to ¥20,000,000 so bidding is fully enabled!');

  // 3. Clear existing places if any to avoid duplication
  await supabase.from('places').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 4. Insert the 30 places
  for (const place of PLACES_30) {
    const { error } = await supabase.from('places').insert({
      place_name: place.place_name,
      description: place.description,
      image_url: place.image_url,
      starting_price: place.starting_price,
      actual_worth: place.actual_worth,
      status: 'NOT_SOLD',
    });

    if (error) {
      console.error(`❌ Error inserting ${place.place_name}:`, error.message);
    } else {
      console.log(`  [#${place.order.toString().padStart(2, '0')}] ${place.place_name.padEnd(12)} | Starting: ¥${place.starting_price.toLocaleString()} | Actual Worth: ¥${place.actual_worth.toLocaleString()}`);
    }
  }

  console.log('\n🎉 Successfully seeded all 30 Japanese Places!');
}

seedPlaces().catch((err) => {
  console.error('Fatal error seeding places:', err);
  process.exit(1);
});
