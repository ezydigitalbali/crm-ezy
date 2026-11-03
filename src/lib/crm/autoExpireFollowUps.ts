import { prisma } from "@/lib/db/prisma";

/**
 * Memeriksa semua prospek dengan status FOLLOW_UP yang dalam 7 hari
 * tidak mengalami pembaruan status / aktivitas respon.
 * 
 * Aturan Bisnis:
 * - Status diubah menjadi FAILED (Gagal / Lost).
 * - Penugasan sales dilepas (assigned_to_id = null).
 * - Riwayat riil (CustomerActivity & AuditLog) tetap dicatat lengkap
 *   menyebutkan sales sebelumnya dan alasan pelepasan otomatis oleh sistem.
 */
export async function autoExpireStaleFollowUps() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    // Cari customer dengan lead_status = FOLLOW_UP yang:
    // (last_contacted_at <= 7 hari lalu OR (last_contacted_at is NULL AND updated_at <= 7 hari lalu))
    const staleCustomers = await prisma.customer.findMany({
      where: {
        lead_status: "FOLLOW_UP",
        OR: [
          {
            last_contacted_at: {
              lte: sevenDaysAgo,
            },
          },
          {
            last_contacted_at: null,
            updated_at: {
              lte: sevenDaysAgo,
            },
          },
        ],
      },
      include: {
        assigned_to: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (staleCustomers.length === 0) {
      return { count: 0, expiredIds: [] };
    }

    const expiredIds: string[] = [];

    for (const c of staleCustomers) {
      const prevSalesName = c.assigned_to?.name || c.last_contacted_by || "Sales";
      const prevSalesId = c.assigned_to_id;

      // Update customer ke status FAILED dan lepas assign
      await prisma.customer.update({
        where: { id: c.id },
        data: {
          lead_status: "FAILED",
          assigned_to_id: null,
          lead_notes: c.lead_notes
            ? `${c.lead_notes}\n[Sistem]: Otomatis kadaluarsa (7 hari tanpa respon dari status Follow Up). Penugasan ${prevSalesName} dilepas.`
            : `[Sistem]: Otomatis kadaluarsa (7 hari tanpa respon dari status Follow Up). Penugasan ${prevSalesName} dilepas.`,
        },
      });

      // Catat CustomerActivity agar riwayat prospek oleh sales tetap utuh & abadi
      await prisma.customerActivity.create({
        data: {
          customer_id: c.id,
          user_id: prevSalesId,
          user_name: "Sistem (Otomatis)",
          action_type: "STATUS_CHANGE",
          status_from: "FOLLOW_UP",
          status_to: "FAILED",
          notes: `Follow up tidak ada respon / tidak berubah dalam 7 hari. Prospek otomatis ditandai Gagal dan penugasan ${prevSalesName} dilepas kembali ke pool prospek.`,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          user_name: "System Auto-Expire",
          action: "CRM_FOLLOW_UP_AUTO_EXPIRE",
          entity: "Customer",
          entity_id: c.id,
          customer_id: c.id,
          metadata: JSON.stringify({
            previousSalesId: prevSalesId,
            previousSalesName: prevSalesName,
            reason: "No response within 7 days in FOLLOW_UP stage",
          }),
        },
      });

      expiredIds.push(c.id);
    }

    return { count: staleCustomers.length, expiredIds };
  } catch (error) {
    console.error("Error in autoExpireStaleFollowUps:", error);
    return { count: 0, expiredIds: [], error };
  }
}

