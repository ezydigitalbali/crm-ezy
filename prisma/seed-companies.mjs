import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateSisterCompanies() {
  console.log("Updating Sister Companies to match official configuration...");

  // Hapus default sebelumnya
  await prisma.sisterCompany.deleteMany({});

  const correctCompanies = [
    {
      name: "Happy Farm Bali",
      code: "HTI",
      description: "Divisi Supplier Daging dan Seafood",
    },
    {
      name: "Happy Farm Jakarta",
      code: "HTJ",
      description: "Divisi Supplier Daging dan Seafood",
    },
    {
      name: "Havenland",
      code: "HVN",
      description: "Divisi Property Management",
    },
    {
      name: "Royal Hindia",
      code: "RHI",
      description: "Divisi Roastery Coffee",
    },
  ];

  for (const comp of correctCompanies) {
    await prisma.sisterCompany.create({
      data: comp,
    });
    console.log(`Sister company created: ${comp.name} [${comp.code}] - ${comp.description}`);
  }

  console.log("Official Sister Companies updated successfully!");
}

updateSisterCompanies()
  .catch((e) => {
    console.error("Error updating sister companies:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
