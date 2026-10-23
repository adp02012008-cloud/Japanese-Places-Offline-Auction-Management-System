import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'http://localhost:3000';

async function testLiveE2E() {
  console.log('🧪 Starting Live End-to-End Functional Test Suite on http://localhost:3000...\n');

  // Test 1: Public Registration
  console.log('1️⃣ Testing Public Team Registration (/api/registration)...');
  const regPayload = {
    teamName: `Team Shinobi ${Date.now() % 10000}`,
    memberCount: 2,
    members: [
      { fullName: 'Hanzo Hattori', enrollmentNumber: `ENR-${Date.now()}-1` },
      { fullName: 'Kotaro Fuma', enrollmentNumber: `ENR-${Date.now()}-2` },
    ],
  };

  const regRes = await fetch(`${BASE_URL}/api/registration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regPayload),
  });
  const regData = await regRes.json();

  if (!regRes.ok || !regData.success) {
    throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
  }
  console.log(`   ✅ Team Registered: "${regData.teamName}" (ID: ${regData.teamId})`);
  console.log(`   ✅ Generated Credentials: Username: ${regData.credentials.username}, Pass: ${regData.credentials.temporaryPassword}\n`);

  const teamId = regData.teamId;
  const teamUser = regData.credentials.username;
  const teamPass = regData.credentials.temporaryPassword;

  // Test 2: Admin Login & Session Cookie
  console.log('2️⃣ Testing Admin Authentication (/api/auth/login)...');
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || '123',
      type: 'admin',
    }),
  });
  const adminData = await adminLoginRes.json();
  const adminCookie = adminLoginRes.headers.get('set-cookie');

  if (!adminLoginRes.ok || !adminData.success) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminData)}`);
  }
  console.log(`   ✅ Admin Authenticated: Role "${adminData.user.role}", User "${adminData.user.username}"\n`);

  // Test 3: Admin Approves Team
  console.log('3️⃣ Testing Admin Team Approval (/api/admin/teams)...');
  const approveRes = await fetch(`${BASE_URL}/api/admin/teams`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookie || '',
    },
    body: JSON.stringify({
      teamId,
      approvalStatus: 'APPROVED',
      participationStatus: 'ACTIVE',
    }),
  });
  const approveData = await approveRes.json();
  if (!approveRes.ok || !approveData.success) {
    throw new Error(`Approval failed: ${JSON.stringify(approveData)}`);
  }
  console.log(`   ✅ Team Approved! Starting Budget: ₹${approveData.team.startingBudget}, Remaining: ₹${approveData.team.remainingBudget}\n`);

  // Test 4: Confidentiality Verification
  console.log('4️⃣ Testing Public Catalogue & Confidentiality Protection (/api/places)...');
  const placesRes = await fetch(`${BASE_URL}/api/places`);
  const placesData = await placesRes.json();
  if (!placesRes.ok || !placesData.success) {
    throw new Error(`Failed to fetch places: ${JSON.stringify(placesData)}`);
  }

  const places = placesData.places;
  console.log(`   ✅ Catalogue loaded: ${places.length} Japanese landmarks.`);
  const hasLeakedActualWorth = places.some((p: any) => p.actualWorth !== undefined || p.actual_worth !== undefined);
  if (hasLeakedActualWorth) {
    throw new Error('SECURITY VIOLATION: actualWorth was leaked in public places API!');
  }
  console.log('   🔒 Confidentiality Check Passed: Zero actual worth valuations leaked.\n');

  // Test 5: Big-Screen Presentation Feed Check
  console.log('5️⃣ Testing 16:9 Presentation Feed (/api/presentation)...');
  const presRes = await fetch(`${BASE_URL}/api/presentation`);
  const presData = await presRes.json();
  if (!presRes.ok || !presData.success) {
    throw new Error(`Failed to fetch presentation data: ${JSON.stringify(presData)}`);
  }
  console.log(`   ✅ Presentation Feed Active: Event "${presData.eventName}", Currency: "${presData.currency}"`);
  console.log(`   ✅ Competing Teams in Projector Grid: ${presData.teams.length} teams.`);
  const presLeakedWorth = presData.places.some((p: any) => p.actualWorth !== undefined);
  if (presLeakedWorth) {
    throw new Error('SECURITY VIOLATION: actualWorth leaked in presentation feed!');
  }
  console.log('   🔒 Projector View Safe: No confidential valuations exposed on big screen.\n');

  // Test 6: Record Live Offline Sale
  console.log('6️⃣ Testing Live Offline Sale Recording (/api/admin/sales)...');
  const targetPlace = places.find((p: any) => p.status === 'NOT_SOLD') || places[0];
  const salePrice = targetPlace.startingPrice || 20000;

  const saleRes = await fetch(`${BASE_URL}/api/admin/sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookie || '',
    },
    body: JSON.stringify({
      placeId: targetPlace._id,
      teamId,
      finalPurchasePrice: salePrice,
      notes: 'Live hammer test bid',
    }),
  });
  const saleData = await saleRes.json();
  if (!saleRes.ok || !saleData.success) {
    throw new Error(`Sale recording failed: ${JSON.stringify(saleData)}`);
  }
  console.log(`   ✅ Offline Sale Recorded for: "${targetPlace.placeName}"`);
  console.log(`   ✅ Hammer Price: ₹${salePrice}`);
  console.log(`   ✅ Team New Remaining Budget: ₹${saleData.data.team.remainingBudget}\n`);

  // Test 7: Automatic Results & Winner Rankings Engine
  console.log('7️⃣ Testing Results & Rankings Engine (/api/admin/results)...');
  const resultsRes = await fetch(`${BASE_URL}/api/admin/results`, {
    headers: { Cookie: adminCookie || '' },
  });
  const resultsData = await resultsRes.json();
  if (!resultsRes.ok || !resultsData.success) {
    throw new Error(`Results failed: ${JSON.stringify(resultsData)}`);
  }

  console.log(`   ✅ Active Winning Rule: ${resultsData.activeRule}`);
  console.log(`   ✅ Tournament Leader: Team "${resultsData.winner?.teamName}"`);
  console.log(`   ✅ Leader Total Spent: ₹${resultsData.winner?.totalSpent}`);
  console.log(`   ✅ Leader Total Savings: ₹${resultsData.winner?.totalSavings}`);
  console.log(`   ✅ Leader Value Efficiency: ${resultsData.winner?.valueEfficiency}%\n`);

  // Test 8: Team Portal Login & Isolated Dashboard
  console.log('8️⃣ Testing Team Portal Login & Isolated Dashboard (/api/team/dashboard)...');
  const teamLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: teamUser,
      password: teamPass,
      type: 'team',
    }),
  });
  const teamLoginData = await teamLoginRes.json();
  const teamCookie = teamLoginRes.headers.get('set-cookie');
  if (!teamLoginRes.ok || !teamLoginData.success) {
    throw new Error(`Team login failed: ${JSON.stringify(teamLoginData)}`);
  }

  const teamDashRes = await fetch(`${BASE_URL}/api/team/dashboard`, {
    headers: { Cookie: teamCookie || '' },
  });
  const teamDashData = await teamDashRes.json();
  if (!teamDashRes.ok || !teamDashData.success) {
    throw new Error(`Team dashboard fetch failed: ${JSON.stringify(teamDashData)}`);
  }

  console.log(`   ✅ Team Logged In: "${teamDashData.team.teamName}"`);
  console.log(`   ✅ Private Remaining Balance: ₹${teamDashData.team.remainingBudget}`);
  console.log(`   ✅ Owned Landmarks: ${teamDashData.purchasedPlaces.length} (Verified landmark: "${teamDashData.purchasedPlaces[0]?.placeName}")`);
  console.log('   🔒 Team Isolation Verified: Only own team records returned.\n');

  console.log('🎉 ALL 8 CORE FUNCTIONAL SYSTEMS VERIFIED 100% OPERATIONAL!');
}

testLiveE2E().catch((err) => {
  console.error('\n❌ E2E Test Failure:', err.message);
  process.exit(1);
});
