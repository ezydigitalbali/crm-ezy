import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/auth";

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    const { 
      customerId, 
      leadStatus, 
      assignedToId, 
      notes, 
      offeringValue,
      dealValue,
      closingServices,
      actionType = "STATUS_CHANGE" 
    } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    const currentCustomer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!currentCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const statusFrom = currentCustomer.lead_status;
    const statusTo = leadStatus || statusFrom;

    const actorName = sessionUser?.name || "Joan (Sales)";

    // Format closing services as comma-separated string if passed as array
    const closingServicesStr = Array.isArray(closingServices) 
      ? closingServices.join(",") 
      : typeof closingServices === "string" 
      ? closingServices 
      : currentCustomer.closing_services;

    const parsedOffering = offeringValue !== undefined 
      ? (offeringValue !== null && offeringValue !== "" ? parseFloat(String(offeringValue)) : null)
      : currentCustomer.offering_value;

    const parsedDeal = dealValue !== undefined 
      ? (dealValue !== null && dealValue !== "" ? parseFloat(String(dealValue)) : null)
      : currentCustomer.deal_value;

    // Update customer CRM fields
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        lead_status: statusTo,
        assigned_to_id: assignedToId !== undefined ? assignedToId : currentCustomer.assigned_to_id,
        offering_value: parsedOffering,
        deal_value: parsedDeal,
        closing_services: closingServicesStr,
        last_contacted_at: (actionType === "WHATSAPP_CHAT" || actionType === "CALL" || actionType === "MEETING" || statusTo !== "NEW_LEAD") ? new Date() : currentCustomer.last_contacted_at,
        last_contacted_by: (actionType === "WHATSAPP_CHAT" || actionType === "CALL" || actionType === "MEETING" || statusTo !== "NEW_LEAD") ? actorName : currentCustomer.last_contacted_by,
        lead_notes: notes || currentCustomer.lead_notes,
      },
    });

    // Record activity in customer timeline
    const activity = await prisma.customerActivity.create({
      data: {
        customer_id: customerId,
        user_id: sessionUser?.id || null,
        user_name: actorName,
        action_type: actionType,
        status_from: statusFrom,
        status_to: statusTo,
        offering_value: parsedOffering,
        deal_value: parsedDeal,
        closing_services: closingServicesStr,
        notes: notes || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        user_name: actorName,
        action: `CRM_${actionType}`,
        entity: "Customer",
        entity_id: customerId,
        customer_id: customerId,
        metadata: JSON.stringify({
          statusFrom,
          statusTo,
          assignedToId,
          notes,
        }),
      },
    });

    return NextResponse.json({ 
      success: true, 
      customer: updatedCustomer, 
      activity 
    });
  } catch (error: any) {
    console.error("CRM Update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
