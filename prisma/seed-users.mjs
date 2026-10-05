import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function seedRealUsers() {
  console.log("Setting up official EZY Digital CRM users...");

  // Remove previous demo users
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  const users = [
    {
      name: "Superadmin",
      email: "superadmin@ezydigitalbali.com",
      password: "Superadmin123@!",
      role: "SUPERADMIN",
      specialty: "Platform & Strategy Lead",
    },
    {
      name: "Ariel",
      email: "ariel@ezydigitalbali.com",
      password: "Ariel123@!",
      role: "HEAD",
      specialty: "Head of Operations & Sales Strategy",
    },
    {
      name: "Joan",
      email: "joan@ezydigitalbali.com",
      password: "Joan123@!",
      role: "SALES",
      specialty: "Website & SEO Specialist",
    },
    {
      name: "Sandra",
      email: "sandra@ezydigitalbali.com",
      password: "Sandra123@!",
      role: "SALES",
      specialty: "Social Media Specialist",
    },
    {
      name: "Dimas",
      email: "dimas@ezydigitalbali.com",
      password: "Dimas123@!",
      role: "SALES",
      specialty: "Production Specialist (Property & Real Estate)",
    },
  ];

  for (const u of users) {
    const password_hash = hashPassword(u.password);
    await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password_hash,
        role: u.role,
        specialty: u.specialty,
      },
    });
    console.log(`Created user: ${u.name} (${u.email}) - Role: ${u.role}`);
  }

  console.log("Official users seeded successfully!");
}

seedRealUsers()
  .catch((e) => {
    console.error("User setup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
