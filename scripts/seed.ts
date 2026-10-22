import mongoose from 'mongoose';
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

// Define schemas inline for standalone runner script
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'ADMIN' },
});

const EventSettingsSchema = new mongoose.Schema({
  eventName: { type: String, default: 'Japanese Places Offline Auction 2026' },
  startingBudgetPerTeam: { type: Number, default: 100000 },
  currency: { type: String, default: '₹' },
  activeWinningRule: { type: String, default: 'SAVINGS' },
  isRegistrationOpen: { type: Boolean, default: true },
  requireAdminApproval: { type: Boolean, default: true },
  isAnnouncementPublic: { type: Boolean, default: false },
});

const PlaceSchema = new mongoose.Schema({
  placeName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  imageStoragePath: { type: String, default: '' },
  startingPrice: { type: Number, required: true },
  actualWorth: { type: Number, required: true },
  status: { type: String, default: 'NOT_SOLD' },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
const EventSettings = mongoose.models.EventSettings || mongoose.model('EventSettings', EventSettingsSchema);
const Place = mongoose.models.Place || mongoose.model('Place', PlaceSchema);

const INITIAL_LANDMARKS = [
  {
    placeName: 'Mount Fuji (富士山)',
    description: 'Japan’s most sacred active volcano and celebrated cultural UNESCO symbol standing at 3,776 meters.',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
    startingPrice: 35000,
    actualWorth: 75000,
  },
  {
    placeName: 'Fushimi Inari Taisha (伏見稲荷大社)',
    description: 'Kyoto’s legendary Shinto shrine renowned for its mesmerizing thousands of vibrant vermilion Torii gates climbing Mount Inari.',
    imageUrl: 'https://images.unsplash.com/photo-1478436127897-769e00d2c715?q=80&w=1200&auto=format&fit=crop',
    startingPrice: 20000,
    actualWorth: 50000,
  },
  {
    placeName: 'Kinkaku-ji Golden Pavilion (金閣寺)',
    description: 'Exquisite Zen Buddhist temple in Kyoto with top two floors entirely covered in brilliant pure gold leaf, overlooking the mirror pond.',
    imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1200&auto=format&fit=crop',
    startingPrice: 25000,
    actualWorth: 60000,
  },
  {
    placeName: 'Himeji Castle (姫路城)',
    description: 'The White Heron Castle, Japan’s largest and best-preserved feudal castle comprising an 83-room defensive network.',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
    startingPrice: 30000,
    actualWorth: 68000,
  },
  {
    placeName: 'Miyajima Itsukushima Shrine (厳島神社)',
    description: 'The iconic "Floating Torii Gate" in Hiroshima Bay appearing to drift weightlessly over the sea during high tide.',
    imageUrl: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?q=80&w=1200&auto=format&fit=crop',
    startingPrice: 22000,
    actualWorth: 52000,
  },
  {
    placeName: 'Arashiyama Sagano Bamboo Grove (嵐山竹林)',
    description: 'Ethereal emerald bamboo pathway in western Kyoto characterized by soaring stalks and rustling winds officially registered as one of Japan’s 100 Soundscapes.',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
    startingPrice: 15000,
    actualWorth: 38000,
  },
  {
    placeName: 'Shirakawa-go Historic Village (白川郷)',
    description: 'Picturesque mountain hamlet famous for steep thatched-roof farmhouses built in Gassho-zukuri (hands in prayer) architectural style.',
    imageUrl: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1200&auto=format&fit=crop',
    startingPrice: 18000,
    actualWorth: 42000,
  },
  {
    placeName: 'Matsumoto Crow Castle (松本城)',
    description: 'One of Japan’s premier historic castles with distinctive black wood cladding and multi-tiered stone ramparts framed by the Northern Alps.',
    imageUrl: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?q=80&w=1200&auto=format&fit=crop',
    startingPrice: 20000,
    actualWorth: 48000,
  },
  {
    placeName: 'Todai-ji Great Buddha Hall (東大寺)',
    description: 'Ancient Nara temple housing the world’s largest bronze statue of the Buddha Vairocana, within one of the largest wooden buildings on Earth.',
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1200&auto=format&fit=crop',
    startingPrice: 24000,
    actualWorth: 55000,
  },
  {
    placeName: 'Sensō-ji Temple Asakusa (浅草寺)',
    description: 'Tokyo’s oldest Buddhist temple founded in 645 AD, approached through the celebrated Kaminarimon Thunder Gate with giant red lantern.',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
    startingPrice: 16000,
    actualWorth: 40000,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is required.');
    process.exit(1);
  }

  console.log('🌸 Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);

  console.log('🌸 Seeding initial Event Settings...');
  const existingSettings = await EventSettings.findOne();
  if (!existingSettings) {
    await EventSettings.create({
      eventName: 'Japanese Places Offline Auction 2026',
      startingBudgetPerTeam: 100000,
      currency: '₹',
      activeWinningRule: 'SAVINGS',
      isRegistrationOpen: true,
      requireAdminApproval: true,
      isAnnouncementPublic: false,
    });
    console.log('✅ Event settings created (Default budget: ₹100,000)');
  }

  console.log('🌸 Seeding Admin Account...');
  const existingAdmin = await Admin.findOne({ username: 'admin' });
  if (!existingAdmin) {
    const passwordHash = await hashPassword('Admin@Sakura2026!');
    await Admin.create({
      username: 'admin',
      passwordHash,
      role: 'ADMIN',
    });
    console.log('✅ Admin initialized (admin / Admin@Sakura2026!)');
  }

  console.log('🌸 Seeding Japanese Places Catalogue...');
  for (const place of INITIAL_LANDMARKS) {
    const exists = await Place.findOne({ placeName: place.placeName });
    if (!exists) {
      await Place.create({
        ...place,
        status: 'NOT_SOLD',
      });
      console.log(`  + Seeded: ${place.placeName} (Starting: ₹${place.startingPrice}, Worth: ₹${place.actualWorth})`);
    }
  }

  console.log('🎉 Seeding completed successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
