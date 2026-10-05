import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DUMMY_CUSTOMERS = [
  // 1. High Website Opportunities (No Website + Active Instagram)
  {
    business_name: "Canggu Sunset Grill",
    contact_name: "Made Suardana",
    phone: "+62 812-3456-7890",
    email: "info@canggusunsetgrill.com",
    address: "Jl. Pantai Batu Bolong No. 45",
    city: "Canggu",
    province: "Bali",
    business_category: "Restaurant",
    website: {
      status: "NOT_FOUND",
      discovery_source: "SEARXNG",
      confidence_score: 15,
      last_checked_at: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    },
    instagram: {
      username: "canggusunsetgrill",
      profile_url: "https://instagram.com/canggusunsetgrill",
      display_name: "Canggu Sunset Grill & Bar",
      status: "ACTIVE",
      last_post_at: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      posts_last_30_days: 12,
      posts_last_90_days: 28,
      discovery_source: "SEARXNG",
      confidence_score: 92,
      manually_verified: true,
      last_checked_at: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    },
  },
  {
    business_name: "Uluwatu Clifftop Retreat",
    contact_name: "Wayan Darmawan",
    phone: "+62 813-8899-1122",
    email: "contact@uluwaturetreat.com",
    address: "Jl. Labuansait No. 88, Pecatu",
    city: "Uluwatu",
    province: "Bali",
    business_category: "Villa",
    website: {
      status: "NOT_FOUND",
      discovery_source: "SEARXNG",
      confidence_score: 20,
      last_checked_at: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    },
    instagram: {
      username: "uluwatucliffretreat",
      profile_url: "https://instagram.com/uluwatucliffretreat",
      display_name: "Uluwatu Clifftop Boutique Villas",
      status: "ACTIVE",
      last_post_at: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      posts_last_30_days: 15,
      posts_last_90_days: 42,
      discovery_source: "SEARXNG",
      confidence_score: 95,
      manually_verified: true,
      last_checked_at: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    },
  },
  {
    business_name: "Batu Belig Artisan Bakery",
    contact_name: "Sarah Jenkins",
    phone: "+62 821-4433-2211",
    email: "hello@batubeligbakery.com",
    address: "Jl. Batu Belig No. 12A",
    city: "Seminyak",
    province: "Bali",
    business_category: "Cafe",
    website: {
      status: "NOT_FOUND",
      discovery_source: "OSM",
      confidence_score: 30,
      last_checked_at: new Date(Date.now() - 4 * 24 * 3600 * 1000),
    },
    instagram: {
      username: "batubeligbakery",
      profile_url: "https://instagram.com/batubeligbakery",
      display_name: "Batu Belig Sourdough & Pastry",
      status: "ACTIVE",
      last_post_at: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      posts_last_30_days: 19,
      posts_last_90_days: 54,
      discovery_source: "SEARXNG",
      confidence_score: 89,
      manually_verified: false,
      last_checked_at: new Date(Date.now() - 4 * 24 * 3600 * 1000),
    },
  },
  {
    business_name: "Nusa Lembongan Surf Camp",
    contact_name: "Ketut Arimbawa",
    phone: "+62 852-7711-3344",
    email: "surf@lembongansurfcamp.com",
    address: "Jungutbatu Beachfront",
    city: "Nusa Lembongan",
    province: "Bali",
    business_category: "Surf Camp",
    website: {
      status: "NOT_FOUND",
      discovery_source: "SEARXNG",
      confidence_score: 10,
      last_checked_at: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    },
    instagram: {
      username: "lembongansurfcamp",
      profile_url: "https://instagram.com/lembongansurfcamp",
      display_name: "Nusa Lembongan Surf & Stay",
      status: "ACTIVE",
      last_post_at: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      posts_last_30_days: 9,
      posts_last_90_days: 25,
      discovery_source: "SEARXNG",
      confidence_score: 94,
      manually_verified: true,
      last_checked_at: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    },
  },
  {
    business_name: "Sayan Wellness & Yoga Retreat",
    contact_name: "Ibu Ketut Dewi",
    phone: "+62 811-3322-9988",
    email: "namaste@sayanwellnessbali.com",
    address: "Jl. Raya Sayan No. 70",
    city: "Ubud",
    province: "Bali",
    business_category: "Yoga Retreat",
    website: {
      status: "NOT_FOUND",
      discovery_source: "OSM",
      confidence_score: 25,
      last_checked_at: new Date(Date.now() - 5 * 24 * 3600 * 1000),
    },
    instagram: {
      username: "sayanwellnessbali",
      profile_url: "https://instagram.com/sayanwellnessbali",
      display_name: "Sayan Sanctuary & Yoga Ubud",
      status: "ACTIVE",
      last_post_at: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      posts_last_30_days: 14,
      posts_last_90_days: 38,
      discovery_source: "SEARXNG",
      confidence_score: 91,
      manually_verified: true,
      last_checked_at: new Date(Date.now() - 5 * 24 * 3600 * 1000),
    },
  },

  // 2. Social Media Opportunity (Active Website + Inactive / Dormant Instagram)
  {
    business_name: "Seminyak Luxury Private Villas",
    contact_name: "Budi Santoso",
    phone: "+62 819-2233-4455",
    email: "reservations@seminyakluxuryvillas.com",
    address: "Jl. Kayu Aya No. 101",
    city: "Seminyak",
    province: "Bali",
    business_category: "Villa",
    website: {
      domain: "seminyakluxuryvillas.com",
      url: "https://seminyakluxuryvillas.com",
      status: "ACTIVE",
      discovery_source: "OSM",
      confidence_score: 98,
      http_status: 200,
      ssl_valid: true,
      final_url: "https://seminyakluxuryvillas.com/",
      response_time_ms: 340,
      last_checked_at: new Date(Date.now() - 10 * 24 * 3600 * 1000),
    },
    instagram: {
      username: "seminyakluxuryvillas",
      profile_url: "https://instagram.com/seminyakluxuryvillas",
      display_name: "Seminyak Luxury Villas Bali",
      status: "DORMANT",
      last_post_at: new Date(Date.now() - 215 * 24 * 3600 * 1000), // 215 days ago
      posts_last_30_days: 0,
      posts_last_90_days: 0,
      discovery_source: "SEARXNG",
      confidence_score: 88,
      manually_verified: true,
      last_checked_at: new Date(Date.now() - 10 * 24 * 3600 * 1000),
    },
  },
  {
    business_name: "Ubud Herbal & Ayurvedic Spa",
    contact_name: "Ni Putu Ariani",
    phone: "+62 813-9988-7766",
    email: "booking@ubudherbalspa.com",
    address: "Jl. Hanoman No. 33",
    city: "Ubud",
    province: "Bali",
    business_category: "Spa & Wellness",
    website: {
      domain: "ubudherbalspa.com",
      url: "https://ubudherbalspa.com",
      status: "ACTIVE",
      discovery_source: "OSM",
      confidence_score: 95,
      http_status: 200,
      ssl_valid: true,
      final_url: "https://ubudherbalspa.com/",
      response_time_ms: 420,
      last_checked_at: new Date(Date.now() - 12 * 24 * 3600 * 1000),
    },
    instagram: {
      username: "ubudherbalspa",
      profile_url: "https://instagram.com/ubudherbalspa",
      display_name: "Ubud Holistic Herbal Spa",
      status: "INACTIVE",
      last_post_at: new Date(Date.now() - 85 * 24 * 3600 * 1000), // 85 days ago
      posts_last_30_days: 0,
      posts_last_90_days: 1,
      discovery_source: "SEARXNG",
      confidence_score: 90,
      manually_verified: true,
      last_checked_at: new Date(Date.now() - 12 * 24 * 3600 * 1000),
    },
  },
  {
    business_name: "Amed Coral Dive Resort",
    contact_name: "Gede Wijaya",
    phone: "+62 812-4455-6677",
    email: "dive@amedcoralresort.com",
    address: "Jl. Raya Amed, Bunutan",
    city: "Karangasem",
    province: "Bali",
    business_category: "Dive Resort",
    website: {
      domain: "amedcoralresort.com",
      url: "https://amedcoralresort.com",
      status: "ACTIVE",
      discovery_source: "SEARXNG",
      confidence_score: 92,
      http_status: 200,
      ssl_valid: true,
      final_url: "https://amedcoralresort.com/",
      response_time_ms: 510,
      last_checked_at: new Date(Date.now() - 8 * 24 * 3600 * 1000),
    },
    instagram: {
      username: "amedcoraldive",
      profile_url: "https://instagram.com/amedcoraldive",
      display_name: "Amed Coral Divers & Resort",
      status: "COOLING",
      last_post_at: new Date(Date.now() - 48 * 24 * 3600 * 1000), // 48 days ago
      posts_last_30_days: 0,
      posts_last_90_days: 3,
      discovery_source: "SEARXNG",
      confidence_score: 87,
      manually_verified: false,
      last_checked_at: new Date(Date.now() - 8 * 24 * 3600 * 1000),
    },
  },

  // 3. Digital Presence Opportunity (Both Not Found)
  {
    business_name: "Warung Nasi Campur Bu Made",
    contact_name: "Ibu Made Sukerti",
    phone: "+62 878-1122-3344",
    email: null,
    address: "Jl. Danau Tamblingan No. 18",
    city: "Sanur",
    province: "Bali",
    business_category: "Restaurant",
    website: {
      status: "NOT_FOUND",
      discovery_source: "OSM",
      confidence_score: 10,
      last_checked_at: new Date(Date.now() - 15 * 24 * 3600 * 1000),
    },
    instagram: {
      status: "NOT_FOUND",
      discovery_source: "SEARXNG",
      confidence_score: 12,
      last_checked_at: new Date(Date.now() - 15 * 24 * 3600 * 1000),
    },
  },
  {
    business_name: "Bengkel Las & Kanopi Dewata",
    contact_name: "Pak Ketut Wira",
    phone: "+62 813-5566-7788",
    email: null,
    address: "Jl. Cargo Permai No. 89",
    city: "Denpasar",
    province: "Bali",
    business_category: "Contractor",
    website: {
      status: "NOT_FOUND",
      discovery_source: "SEARXNG",
      confidence_score: 5,
      last_checked_at: new Date(Date.now() - 20 * 24 * 3600 * 1000),
    },
    instagram: {
      status: "NOT_FOUND",
      discovery_source: "SEARXNG",
      confidence_score: 8,
      last_checked_at: new Date(Date.now() - 20 * 24 * 3600 * 1000),
    },
  },

  // 4. Fully Active (Both Active -> SEO Candidates)
  {
    business_name: "Finns Beach Club",
    contact_name: "Operations Dept",
    phone: "+62 361-844-6327",
    email: "info@finnsbeachclub.com",
    address: "Jl. Pantai Berawa No. 99",
    city: "Canggu",
    province: "Bali",
    business_category: "Beach Club",
    website: {
      domain: "finnsbeachclub.com",
      url: "https://finnsbeachclub.com",
      status: "ACTIVE",
      discovery_source: "OSM",
      confidence_score: 100,
      http_status: 200,
      ssl_valid: true,
      final_url: "https://finnsbeachclub.com/",
      response_time_ms: 180,
      last_checked_at: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    },
    instagram: {
      username: "finnsbeachclub",
      profile_url: "https://instagram.com/finnsbeachclub",
      display_name: "Finns Beach Club Bali",
      status: "ACTIVE",
      last_post_at: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      posts_last_30_days: 28,
      posts_last_90_days: 86,
      discovery_source: "SEARXNG",
      confidence_score: 99,
      manually_verified: true,
      last_checked_at: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    },
  },
  {
    business_name: "Revolver Espresso Bali",
    contact_name: "Darren Kelly",
    phone: "+62 851-0084-4434",
    email: "hello@revolverespresso.com",
    address: "Jl. Kayu Aya No. 51",
    city: "Seminyak",
    province: "Bali",
    business_category: "Cafe",
    website: {
      domain: "revolverespresso.com",
      url: "https://revolverespresso.com",
      status: "ACTIVE",
      discovery_source: "OSM",
      confidence_score: 99,
      http_status: 200,
      ssl_valid: true,
      final_url: "https://revolverespresso.com/",
      response_time_ms: 210,
      last_checked_at: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    },
    instagram: {
      username: "revolver.bali",
      profile_url: "https://instagram.com/revolver.bali",
      display_name: "REVOLVER BALI",
      status: "ACTIVE",
      last_post_at: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      posts_last_30_days: 22,
      posts_last_90_days: 64,
      discovery_source: "SEARXNG",
      confidence_score: 98,
      manually_verified: true,
      last_checked_at: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    },
  },
  {
    business_name: "Sisterfields Cafe",
    contact_name: "Adam Flanders",
    phone: "+62 811-3860-507",
    email: "eat@sisterfields.com",
    address: "Jl. Kayu Cendana No. 7",
    city: "Seminyak",
    province: "Bali",
    business_category: "Cafe",
    website: {
      domain: "sisterfields.com",
      url: "https://sisterfields.com",
      status: "ACTIVE",
      discovery_source: "OSM",
      confidence_score: 99,
      http_status: 200,
      ssl_valid: true,
      final_url: "https://sisterfields.com/",
      response_time_ms: 240,
      last_checked_at: new Date(Date.now() - 4 * 24 * 3600 * 1000),
    },
    instagram: {
      username: "sisterfields",
      profile_url: "https://instagram.com/sisterfields",
      display_name: "Sisterfields",
      status: "ACTIVE",
      last_post_at: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      posts_last_30_days: 18,
      posts_last_90_days: 52,
      discovery_source: "SEARXNG",
      confidence_score: 97,
      manually_verified: true,
      last_checked_at: new Date(Date.now() - 4 * 24 * 3600 * 1000),
    },
  },

  // 5. Needs Review (Candidates need human confirmation)
  {
    business_name: "Kedonganan Fresh Seafood",
    contact_name: "Made Sujana",
    phone: "+62 812-7788-9900",
    email: "info@kedongananfreshseafood.com",
    address: "Pantai Kedonganan No. 14",
    city: "Jimbaran",
    province: "Bali",
    business_category: "Restaurant",
    website: {
      status: "NEEDS_REVIEW",
      discovery_source: "SEARXNG",
      confidence_score: 68,
      last_checked_at: new Date(Date.now() - 6 * 24 * 3600 * 1000),
    },
    instagram: {
      username: "kedonganan_seafood_bali",
      profile_url: "https://instagram.com/kedonganan_seafood_bali",
      display_name: "Kedonganan Seafood Cafe & Resto",
      status: "NEEDS_REVIEW",
      last_post_at: new Date(Date.now() - 14 * 24 * 3600 * 1000),
      posts_last_30_days: 3,
      posts_last_90_days: 9,
      discovery_source: "SEARXNG",
      confidence_score: 72,
      manually_verified: false,
      last_checked_at: new Date(Date.now() - 6 * 24 * 3600 * 1000),
    },
    candidates: {
      websites: [
        { domain: "kedongananseafood.com", url: "https://kedongananseafood.com", source: "SEARXNG", confidence_score: 74 },
        { domain: "kedonganancafe.id", url: "https://kedonganancafe.id", source: "SEARXNG", confidence_score: 65 },
      ],
      instagrams: [
        { username: "kedonganan_seafood_bali", profile_url: "https://instagram.com/kedonganan_seafood_bali", display_name: "Kedonganan Seafood Cafe & Resto", confidence_score: 72 },
        { username: "kedonganancafebali", profile_url: "https://instagram.com/kedonganancafebali", display_name: "Pantai Kedonganan Cafe", confidence_score: 64 },
      ],
    },
  },

  // 6. Inactive Website (Broken / Expired) + Active Instagram
  {
    business_name: "Echo Beach Surf & Stay",
    contact_name: "Komang Bagus",
    phone: "+62 822-1133-5577",
    email: "contact@echobeachsurfstay.com",
    address: "Jl. Pura Batu Mejan No. 8",
    city: "Canggu",
    province: "Bali",
    business_category: "Hotel",
    website: {
      domain: "echobeachsurfstay.com",
      url: "http://echobeachsurfstay.com",
      status: "INACTIVE",
      discovery_source: "OSM",
      confidence_score: 85,
      http_status: 502,
      ssl_valid: false,
      final_url: "http://echobeachsurfstay.com",
      response_time_ms: 3200,
      last_checked_at: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    },
    instagram: {
      username: "echobeachsurfstay",
      profile_url: "https://instagram.com/echobeachsurfstay",
      display_name: "Echo Beach Surf & Stay Canggu",
      status: "ACTIVE",
      last_post_at: new Date(Date.now() - 6 * 24 * 3600 * 1000),
      posts_last_30_days: 10,
      posts_last_90_days: 31,
      discovery_source: "SEARXNG",
      confidence_score: 93,
      manually_verified: true,
      last_checked_at: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    },
  },
];

async function main() {
  console.log("Cleaning old CRM database records...");
  await prisma.customerActivity.deleteMany({});
  await prisma.sisterCompany.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.scanJobItem.deleteMany({});
  await prisma.scanJob.deleteMany({});
  await prisma.websiteCheck.deleteMany({});
  await prisma.websiteCandidate.deleteMany({});
  await prisma.website.deleteMany({});
  await prisma.instagramCheck.deleteMany({});
  await prisma.instagramCandidate.deleteMany({});
  await prisma.instagramProfile.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.setting.deleteMany({});

  console.log("Seeding master Sister Companies...");
  await prisma.sisterCompany.createMany({
    data: [
      { name: "EZY Property & Villas", code: "EZY_PROP", description: "Spesialis villa luxury, resort & property management di Bali" },
      { name: "EZY Hospitality", code: "EZY_HOSP", description: "Divisi restoran, cafe, bar, beach club & wellness spa di Bali" },
      { name: "EZY Travel & Tours", code: "EZY_TRVL", description: "Divisi travel agent, dive resort, surf camp & tour operator" },
    ],
  });

  const users = await prisma.user.findMany();
  const joan = users.find(u => u.name.toLowerCase().includes("joan"));
  const sandra = users.find(u => u.name.toLowerCase().includes("sandra"));
  const dimas = users.find(u => u.name.toLowerCase().includes("dimas"));

  console.log(`Seeding ${DUMMY_CUSTOMERS.length} realistic customer records with CRM pipeline data...`);

  let idx = 0;
  for (const c of DUMMY_CUSTOMERS) {
    idx++;
    let sisterCompany = "EZY Property & Villas";
    const catLower = (c.business_category || "").toLowerCase();
    if (catLower.includes("villa") || catLower.includes("resort") || catLower.includes("hotel") || catLower.includes("property")) {
      sisterCompany = "EZY Property & Villas";
    } else if (catLower.includes("restaurant") || catLower.includes("cafe") || catLower.includes("bakery") || catLower.includes("spa") || catLower.includes("club")) {
      sisterCompany = "EZY Hospitality";
    } else if (catLower.includes("surf") || catLower.includes("dive") || catLower.includes("yoga") || catLower.includes("travel")) {
      sisterCompany = "EZY Travel & Tours";
    }

    // Realistic CRM assignment & status distribution
    let assignedUser = null;
    let leadStatus = "NEW_LEAD";
    let lastContactedAt = null;
    let lastContactedBy = null;
    let leadNotes = null;

    if (idx === 1) { // Canggu Sunset Grill
      assignedUser = joan;
      leadStatus = "NEGOTIATION";
      lastContactedAt = new Date(Date.now() - 1 * 24 * 3600 * 1000); // 1 day ago
      lastContactedBy = joan?.name || "Joan";
      leadNotes = "Sudah chat WA via template website dev. Klien tertarik proposal paket Web Dev Pro + booking direct WhatsApp. Estimasi closing minggu ini.";
    } else if (idx === 2) { // Uluwatu Clifftop Retreat
      assignedUser = dimas;
      leadStatus = "SUCCESS";
      lastContactedAt = new Date(Date.now() - 3 * 24 * 3600 * 1000); // 3 days ago
      lastContactedBy = dimas?.name || "Dimas";
      leadNotes = "Closing deal paket Foto Arsitektur 4K & Drone FPV Rp 25.000.000! Jadwal shooting hari Kamis depan.";
    } else if (idx === 3) { // Batu Belig Artisan Bakery
      assignedUser = joan;
      leadStatus = "CONTACTED";
      lastContactedAt = new Date(Date.now() - 2 * 24 * 3600 * 1000); // 2 days ago
      lastContactedBy = joan?.name || "Joan";
      leadNotes = "Sudah hubungi via WA template, menyebut referensi EZY Hospitality. Owner merespon positif dan minta dikirimi company profile.";
    } else if (idx === 4) { // Nusa Lembongan Surf Camp
      assignedUser = sandra;
      leadStatus = "FOLLOW_UP";
      lastContactedAt = new Date(Date.now() - 4 * 24 * 3600 * 1000);
      lastContactedBy = sandra?.name || "Sandra";
      leadNotes = "Follow up mengenai paket Social Media management & website tour booking. Jadwal call hari Jumat.";
    } else if (idx === 5) { // Sayan Wellness & Yoga
      assignedUser = sandra;
      leadStatus = "CONTACTED";
      lastContactedAt = new Date(Date.now() - 2 * 24 * 3600 * 1000);
      lastContactedBy = sandra?.name || "Sandra";
      leadNotes = "Telah mengirim pesan perkenalan via WhatsApp. Menunggu respon dari manager operasional.";
    } else if (idx === 6) { // Seminyak Luxury Private Villas
      assignedUser = dimas;
      leadStatus = "NEGOTIATION";
      lastContactedAt = new Date(Date.now() - 1 * 24 * 3600 * 1000);
      lastContactedBy = dimas?.name || "Dimas";
      leadNotes = "Diskusi pembuatan 3D Virtual Walkthrough Tour untuk buyer Eropa & Australia. Penawaran harga sedang ditinjau owner.";
    } else if (idx === 7) { // Ubud Herbal & Ayurvedic Spa
      assignedUser = sandra;
      leadStatus = "SUCCESS";
      lastContactedAt = new Date(Date.now() - 5 * 24 * 3600 * 1000);
      lastContactedBy = sandra?.name || "Sandra";
      leadNotes = "Closing paket Social Media Management 3 bulan (Reels + Content Plan harian). Down payment 50% sudah diterima.";
    } else if (idx === 8) { // Amed Coral Dive Resort
      assignedUser = dimas;
      leadStatus = "FOLLOW_UP";
      lastContactedAt = new Date(Date.now() - 3 * 24 * 3600 * 1000);
      lastContactedBy = dimas?.name || "Dimas";
      leadNotes = "Owner tertarik video bawah air (underwater) & drone pantai Amed. Menunggu konfirmasi cuaca.";
    } else if (idx === 9) { // Warung Nasi Campur Bu Made
      assignedUser = joan;
      leadStatus = "FAILED";
      lastContactedAt = new Date(Date.now() - 6 * 24 * 3600 * 1000);
      lastContactedBy = joan?.name || "Joan";
      leadNotes = "Owner menyatakan saat ini belum memprioritaskan digitalisasi online karena fokus offline.";
    } else if (idx === 10) { // Bengkel Las & Kanopi
      leadStatus = "NEW_LEAD"; // unassigned
    } else if (idx === 11) { // Finns Beach Club
      assignedUser = joan;
      leadStatus = "CONTACTED";
      lastContactedAt = new Date(Date.now() - 1 * 24 * 3600 * 1000);
      lastContactedBy = joan?.name || "Joan";
      leadNotes = "Sudah menghubungi tim marcomm Finns via WA untuk audit SEO website.";
    } else {
      leadStatus = "NEW_LEAD";
    }

    const customer = await prisma.customer.create({
      data: {
        business_name: c.business_name,
        contact_name: c.contact_name,
        phone: c.phone,
        email: c.email,
        address: c.address,
        city: c.city,
        province: c.province,
        business_category: c.business_category,
        source: "SEED_DUMMY",
        sister_company: sisterCompany,
        lead_status: leadStatus,
        assigned_to_id: assignedUser?.id || null,
        last_contacted_at: lastContactedAt,
        last_contacted_by: lastContactedBy,
        lead_notes: leadNotes,
      },
    });

    // Create initial activity if contacted
    if (lastContactedAt && assignedUser) {
      await prisma.customerActivity.create({
        data: {
          customer_id: customer.id,
          user_id: assignedUser.id,
          user_name: assignedUser.name,
          action_type: "WHATSAPP_CHAT",
          status_from: "NEW_LEAD",
          status_to: leadStatus,
          notes: leadNotes,
          created_at: lastContactedAt,
        },
      });
    }

    if (c.website) {
      const createdWebsite = await prisma.website.create({
        data: {
          customer_id: customer.id,
          domain: c.website.domain || null,
          url: c.website.url || null,
          status: c.website.status,
          discovery_source: c.website.discovery_source,
          confidence_score: c.website.confidence_score,
          http_status: c.website.http_status || null,
          ssl_valid: c.website.ssl_valid || null,
          final_url: c.website.final_url || null,
          response_time_ms: c.website.response_time_ms || null,
          last_checked_at: c.website.last_checked_at,
          first_discovered_at: c.website.last_checked_at,
        },
      });

      // Add a couple of historical checks
      await prisma.websiteCheck.create({
        data: {
          website_id: createdWebsite.id,
          status: c.website.status,
          http_status: c.website.http_status || null,
          ssl_valid: c.website.ssl_valid || null,
          response_time_ms: c.website.response_time_ms || null,
          checked_at: c.website.last_checked_at || new Date(),
        },
      });
    }

    if (c.instagram) {
      const createdInstagram = await prisma.instagramProfile.create({
        data: {
          customer_id: customer.id,
          username: c.instagram.username || null,
          profile_url: c.instagram.profile_url || null,
          display_name: c.instagram.display_name || null,
          status: c.instagram.status,
          last_post_at: c.instagram.last_post_at || null,
          posts_last_30_days: c.instagram.posts_last_30_days || 0,
          posts_last_90_days: c.instagram.posts_last_90_days || 0,
          discovery_source: c.instagram.discovery_source,
          confidence_score: c.instagram.confidence_score,
          manually_verified: c.instagram.manually_verified || false,
          last_checked_at: c.instagram.last_checked_at,
        },
      });

      // Add historical check
      await prisma.instagramCheck.create({
        data: {
          instagram_id: createdInstagram.id,
          status: c.instagram.status,
          last_post_at: c.instagram.last_post_at || null,
          posts_last_30_days: c.instagram.posts_last_30_days || 0,
          posts_last_90_days: c.instagram.posts_last_90_days || 0,
          checked_at: c.instagram.last_checked_at || new Date(),
        },
      });
    }

    // Add candidates if any
    if (c.candidates) {
      if (c.candidates.websites) {
        for (const wc of c.candidates.websites) {
          await prisma.websiteCandidate.create({
            data: {
              customer_id: customer.id,
              domain: wc.domain,
              url: wc.url,
              source: wc.source,
              confidence_score: wc.confidence_score,
            },
          });
        }
      }
      if (c.candidates.instagrams) {
        for (const ic of c.candidates.instagrams) {
          await prisma.instagramCandidate.create({
            data: {
              customer_id: customer.id,
              username: ic.username,
              profile_url: ic.profile_url,
              display_name: ic.display_name,
              confidence_score: ic.confidence_score,
            },
          });
        }
      }
    }

    // Log seed activity
    await prisma.auditLog.create({
      data: {
        user_name: "System Seed",
        action: "IMPORT_CUSTOMER",
        entity: "Customer",
        entity_id: customer.id,
        customer_id: customer.id,
        metadata: JSON.stringify({ business_name: customer.business_name }),
      },
    });
  }

  // Create an initial scan job record
  const initialScan = await prisma.scanJob.create({
    data: {
      type: "ALL",
      status: "COMPLETED",
      total: DUMMY_CUSTOMERS.length,
      processed: DUMMY_CUSTOMERS.length,
      successful: DUMMY_CUSTOMERS.length - 2,
      needs_review: 2,
      failed: 0,
      created_by: "System",
      started_at: new Date(Date.now() - 3600 * 1000),
      completed_at: new Date(),
    },
  });

  // Settings
  await prisma.setting.createMany({
    data: [
      { key: "SEARCH_PROVIDER", value: "SEARXNG" },
      { key: "SEARXNG_URL", value: "http://localhost:8080" },
      { key: "MAX_CONCURRENCY", value: "3" },
      { key: "AUTO_RECHECK_DAYS", value: "7" },
    ],
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
