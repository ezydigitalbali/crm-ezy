import { prisma } from "@/lib/db/prisma";

export interface ReminderCustomer {
  id: string;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  sister_company: string | null;
  assigned_to_id: string | null;
  assigned_to_name: string | null;
  lead_status: string;
  last_contacted_at: string | null;
  days_remaining: number;
  days_since_contact: number;
  status: "CRITICAL" | "WARNING" | "NOTICE"; // 1 hari, 2-3 hari, 4-5 hari
}

export async function getExpiringFollowUps(userId?: string, role?: string): Promise<ReminderCustomer[]> {
  const now = new Date();
  
  // Follow Up kadaluarsa setelah 7 hari
  // Jadi yang mau expired adalah yang sudah 3 s/d 7 hari belum ada kabar
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const whereClause: any = {
    lead_status: "FOLLOW_UP",
    OR: [
      {
        last_contacted_at: {
          lte: threeDaysAgo,
          gt: sevenDaysAgo,
        },
      },
      {
        last_contacted_at: null,
        updated_at: {
          lte: threeDaysAgo,
          gt: sevenDaysAgo,
        },
      },
    ],
  };

  // Jika sales murni, batasi ke lead miliknya
  if (userId && role === "SALES") {
    whereClause.assigned_to_id = userId;
  }

  const customers = await prisma.customer.findMany({
    where: whereClause,
    include: {
      assigned_to: {
        select: { id: true, name: true },
      },
    },
    orderBy: [
      { last_contacted_at: "asc" },
      { updated_at: "asc" },
    ],
  });

  return customers.map((c) => {
    const referenceDate = c.last_contacted_at || c.updated_at;
    const diffMs = now.getTime() - new Date(referenceDate).getTime();
    const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, 7 - daysSince);

    let status: "CRITICAL" | "WARNING" | "NOTICE" = "NOTICE";
    if (daysLeft <= 1) {
      status = "CRITICAL";
    } else if (daysLeft <= 3) {
      status = "WARNING";
    }

    return {
      id: c.id,
      business_name: c.business_name,
      contact_name: c.contact_name,
      phone: c.phone,
      sister_company: c.sister_company,
      assigned_to_id: c.assigned_to_id,
      assigned_to_name: c.assigned_to?.name || null,
      lead_status: c.lead_status,
      last_contacted_at: referenceDate.toISOString(),
      days_remaining: daysLeft,
      days_since_contact: daysSince,
      status,
    };
  });
}

