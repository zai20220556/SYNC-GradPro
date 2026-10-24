// Demo data: fake users and listings. Run with: npm run db:seed
// All demo accounts use the password: password123
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const hash = await bcrypt.hash('password123', 10);

const seekers = [
  { email: 'hackathon@demo.jo', name: 'PSUT Computing Club', type: 'Student club', city: 'Amman', verified: true },
  { email: 'runners@demo.jo', name: 'Amman Runners', type: 'Sports team', city: 'Amman', verified: true },
  { email: 'lina@demo.jo', name: 'Lina K.', type: 'Content creator', city: 'Amman', verified: false },
  { email: 'debate@demo.jo', name: 'Yarmouk Debate Club', type: 'Student club', city: 'Irbid', verified: true },
  { email: 'music@demo.jo', name: 'Night Notes Collective', type: 'Event organizer', city: 'Amman', verified: false },
  { email: 'charity@demo.jo', name: 'Hand in Hand Jordan', type: 'Charity', city: 'Zarqa', verified: true },
];

const listings = [
  { s: 0, title: 'PSUT Hackathon 2027', category: 'Events', city: 'Amman', reach: 900, aud: 'Students, 18-24', promoted: true,
    pk: [['Snack partner', 150, 'Logo on tables, snack stand, 1 shout-out'], ['Main sponsor', 600, 'Logo on banner and T-shirts, speaking slot, social posts']] },
  { s: 1, title: 'Amman Trail Run', category: 'Sports', city: 'Amman', reach: 1200, aud: 'Runners, 20-40',
    pk: [['Water station', 200, 'Branded water station and 2 posts'], ['Title sponsor', 900, 'Race name, bibs, finish-line banner']] },
  { s: 2, title: 'Lina’s Amman food reviews', category: 'Creators', city: 'Amman', reach: 8000, aud: 'Young adults, 18-30',
    pk: [['One post', 80, '1 Instagram post at your cafe'], ['Post + stories', 140, '1 post and 5 stories with location tag']] },
  { s: 3, title: 'Debate Club National Cup', category: 'Student activities', city: 'Irbid', reach: 400, aud: 'University students',
    pk: [['Supporter', 100, 'Logo on programme and 1 shout-out']] },
  { s: 4, title: 'Rainbow Street Music Night', category: 'Events', city: 'Amman', reach: 2500, aud: 'Young adults, 20-35',
    pk: [['Drinks partner', 300, 'Branded bar and stage mention'], ['Headline partner', 1000, 'Stage banner, posters, 6 social posts']] },
  { s: 5, title: 'Warm Winter Drive', category: 'Charity', city: 'Zarqa', reach: 3000, aud: 'Families',
    pk: [['Meal sponsor', 250, 'Logo on 500 meal bags']] },
];

await prisma.listing.deleteMany();
const profiles = [];
for (const s of seekers) {
  const user = await prisma.user.upsert({
    where: { email: s.email },
    update: {},
    create: { email: s.email, passwordHash: hash, role: 'SEEKER', isVerified: s.verified,
      seekerProfile: { create: { name: s.name, seekerType: s.type, city: s.city } } },
    include: { seekerProfile: true },
  });
  profiles.push(user.seekerProfile ?? (await prisma.seekerProfile.findUnique({ where: { userId: user.id } })));
}

await prisma.user.upsert({
  where: { email: 'olive@demo.jo' }, update: {},
  create: { email: 'olive@demo.jo', passwordHash: hash, role: 'SPONSOR',
    sponsorProfile: { create: { businessName: 'Olive & Co. Cafe', industry: 'Restaurant or cafe', city: 'Amman', budgetMin: 100, budgetMax: 800 } } },
});
await prisma.user.upsert({
  where: { email: 'admin@demo.jo' }, update: {},
  create: { email: 'admin@demo.jo', passwordHash: hash, role: 'ADMIN', isVerified: true },
});

for (const l of listings) {
  await prisma.listing.create({
    data: { seekerId: profiles[l.s].id, title: l.title, category: l.category, city: l.city,
      description: `${l.title} in ${l.city}. Audience: ${l.aud}.`, targetAudience: l.aud,
      expectedReach: l.reach, isPromoted: !!l.promoted,
      packages: { create: l.pk.map(([name, price, benefits]) => ({ name, price, benefits })) } },
  });
}
console.log('Seeded demo data. Demo logins: olive@demo.jo (sponsor), hackathon@demo.jo (seeker), admin@demo.jo. Password: password123');
await prisma.$disconnect();
