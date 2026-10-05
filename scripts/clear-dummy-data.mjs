import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Memulai pembersihan data dummy dari database...");

  // 1. Delete customer activities & checks explicitly or through cascade
  const activitiesDeleted = await prisma.customerActivity.deleteMany({});
  console.log(`- Dihapus: ${activitiesDeleted.count} customer activities`);

  const igChecksDeleted = await prisma.instagramCheck.deleteMany({});
  console.log(`- Dihapus: ${igChecksDeleted.count} instagram checks`);

  const igProfilesDeleted = await prisma.instagramProfile.deleteMany({});
  console.log(`- Dihapus: ${igProfilesDeleted.count} instagram profiles`);

  const webChecksDeleted = await prisma.websiteCheck.deleteMany({});
  console.log(`- Dihapus: ${webChecksDeleted.count} website checks`);

  const webDeleted = await prisma.website.deleteMany({});
  console.log(`- Dihapus: ${webDeleted.count} websites`);

  const candidatesWeb = await prisma.websiteCandidate.deleteMany({});
  console.log(`- Dihapus: ${candidatesWeb.count} website candidates`);

  const candidatesIg = await prisma.instagramCandidate.deleteMany({});
  console.log(`- Dihapus: ${candidatesIg.count} instagram candidates`);

  const scanItems = await prisma.scanJobItem.deleteMany({});
  console.log(`- Dihapus: ${scanItems.count} scan job items`);

  const scanJobs = await prisma.scanJob.deleteMany({});
  console.log(`- Dihapus: ${scanJobs.count} scan jobs`);

  const importJobs = await prisma.importJob.deleteMany({});
  console.log(`- Dihapus: ${importJobs.count} import jobs`);

  // 2. Delete all customers
  const customersDeleted = await prisma.customer.deleteMany({});
  console.log(`- Dihapus: ${customersDeleted.count} customers (data dummy)`);

  // 3. Clear customer-related audit logs
  const auditLogs = await prisma.auditLog.deleteMany({
    where: {
      entity: {
        in: ["Customer", "Website", "InstagramProfile", "CRM"]
      }
    }
  });
  console.log(`- Dihapus: ${auditLogs.count} customer audit logs`);

  // 4. Verify retained data
  const users = await prisma.user.findMany({ select: { name: true, email: true, role: true } });
  const sisterCompanies = await prisma.sisterCompany.findMany({ select: { name: true } });

  console.log("\n✅ Database siap untuk upload data baru!");
  console.log("👥 Akun Sales & Superadmin tetap tersimpan:");
  users.forEach((u) => console.log(`   - ${u.name} (${u.email}) [${u.role}]`));

  console.log("🏢 Sister Company yang tetap aktif:");
  sisterCompanies.forEach((sc) => console.log(`   - ${sc.name}`));
}

main()
  .catch((e) => {
    console.error("❌ Gagal membersihkan database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
