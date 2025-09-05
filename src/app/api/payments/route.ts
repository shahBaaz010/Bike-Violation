import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database/mongo";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseId, amount, currency = "USD", method = "bank_transfer", reference } = body || {};

    if (!caseId) {
      return NextResponse.json({ success: false, error: "caseId is required" }, { status: 400 });
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json({ success: false, error: "amount is required" }, { status: 400 });
    }

    const numericAmount = typeof amount === "string" ? parseFloat(amount) : Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ success: false, error: "amount must be a positive number" }, { status: 400 });
    }

    // Normalize method to the shape expected by createPayment (id/type/provider)
    const methodObj = typeof method === "string"
      ? { id: method, type: method, provider: "bank" }
      : method;

    // create a dummy payment record
    const payment = await db.createPayment({
      caseId,
      amount: numericAmount,
      currency,
      method: methodObj,
      transactionId: reference || `bank-${Date.now()}`,
      status: "completed",
      paidAt: new Date().toISOString(),
    });

    // mark case paid (best-effort)
    const updatedCase = await db.updateCase(caseId, { status: "paid" });

    return NextResponse.json({ success: true, data: { payment, case: updatedCase } }, { status: 201 });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ success: false, error: "Failed to process payment" }, { status: 500 });
  }
}
