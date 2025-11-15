// app/api/coupons/seed/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongo";

const COUPONS_COLLECTION = "coupons";

const initialCoupons = [
  {
    title: "National Museum Entry - 50% Off",
    description: "Half price admission to any participating national museum",
    category: "museum",
    discount: "50%",
    pointsCost: 50,
    totalUses: 200,
    usesRemaining: 200,
    validUntil: new Date("2025-12-31"),
    icon: "🏛️",
  },
  {
    title: "Coffee Shop - Buy 1 Get 1 Free",
    description: "Get a free coffee with any purchase at participating cafes",
    category: "coffee",
    discount: "BOGO",
    pointsCost: 25,
    totalUses: 150,
    usesRemaining: 150,
    validUntil: new Date("2025-12-31"),
    icon: "☕",
  },
  {
    title: "Local Restaurant - 30% Off Meal",
    description: "30% discount on your total bill at traditional restaurants",
    category: "food",
    discount: "30%",
    pointsCost: 75,
    totalUses: 100,
    usesRemaining: 100,
    validUntil: new Date("2025-12-31"),
    icon: "🍽️",
  },
  {
    title: "Art Gallery - Free Entry",
    description: "Complimentary admission to select art galleries",
    category: "museum",
    discount: "100%",
    pointsCost: 40,
    totalUses: 180,
    usesRemaining: 180,
    validUntil: new Date("2025-12-31"),
    icon: "🎨",
  },
  {
    title: "Traditional Tea House - 20% Off",
    description: "Save 20% on authentic tea experiences",
    category: "coffee",
    discount: "20%",
    pointsCost: 30,
    totalUses: 120,
    usesRemaining: 120,
    validUntil: new Date("2025-12-31"),
    icon: "🍵",
  },
  {
    title: "Cultural Festival Pass - $10 Off",
    description: "Get $10 off admission to cultural festivals",
    category: "museum",
    discount: "$10",
    pointsCost: 60,
    totalUses: 90,
    usesRemaining: 90,
    validUntil: new Date("2025-12-31"),
    icon: "🎭",
  },
  {
    title: "Bakery - Free Pastry",
    description: "One free pastry with any purchase",
    category: "food",
    discount: "Free Item",
    pointsCost: 20,
    totalUses: 200,
    usesRemaining: 200,
    validUntil: new Date("2025-12-31"),
    icon: "🥐",
  },
  {
    title: "Historical Site Tour - 40% Off",
    description: "Save 40% on guided historical tours",
    category: "museum",
    discount: "40%",
    pointsCost: 80,
    totalUses: 75,
    usesRemaining: 75,
    validUntil: new Date("2025-12-31"),
    icon: "🏰",
  },
  {
    title: "Specialty Coffee - $5 Off",
    description: "$5 discount on premium coffee blends",
    category: "coffee",
    discount: "$5",
    pointsCost: 35,
    totalUses: 160,
    usesRemaining: 160,
    validUntil: new Date("2025-12-31"),
    icon: "☕",
  },
  {
    title: "Ethnic Food Market - 25% Off",
    description: "25% discount on authentic ingredients",
    category: "food",
    discount: "25%",
    pointsCost: 45,
    totalUses: 140,
    usesRemaining: 140,
    validUntil: new Date("2025-12-31"),
    icon: "🛒",
  },
  {
    title: "Museum Gift Shop - 15% Off",
    description: "Save 15% on cultural souvenirs",
    category: "museum",
    discount: "15%",
    pointsCost: 25,
    totalUses: 200,
    usesRemaining: 200,
    validUntil: new Date("2025-12-31"),
    icon: "🎁",
  },
  {
    title: "Dessert Cafe - Free Dessert",
    description: "Complimentary dessert with any main order",
    category: "food",
    discount: "Free Item",
    pointsCost: 40,
    totalUses: 110,
    usesRemaining: 110,
    validUntil: new Date("2025-12-31"),
    icon: "🍰",
  },
  {
    title: "Heritage Workshop - 50% Off",
    description: "Half price on traditional craft workshops",
    category: "museum",
    discount: "50%",
    pointsCost: 90,
    totalUses: 60,
    usesRemaining: 60,
    validUntil: new Date("2025-12-31"),
    icon: "🎨",
  },
  {
    title: "Juice Bar - Buy 2 Get 1 Free",
    description: "Get a free juice with every 2 purchases",
    category: "coffee",
    discount: "B2G1",
    pointsCost: 30,
    totalUses: 130,
    usesRemaining: 130,
    validUntil: new Date("2025-12-31"),
    icon: "🥤",
  },
  {
    title: "Fine Dining - $25 Off",
    description: "Save $25 on meals at upscale restaurants",
    category: "food",
    discount: "$25",
    pointsCost: 100,
    totalUses: 50,
    usesRemaining: 50,
    validUntil: new Date("2025-12-31"),
    icon: "🍷",
  },
];

export async function POST() {
  try {
    const db = await getDb();

    // Check if coupons already exist
    const existingCount = await db.collection(COUPONS_COLLECTION).countDocuments();
    
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: "Coupons already seeded.",
        count: existingCount 
      });
    }

    // Insert all coupons
    const result = await db.collection(COUPONS_COLLECTION).insertMany(
      initialCoupons.map(coupon => ({
        ...coupon,
        createdAt: new Date(),
      }))
    );

    return NextResponse.json({
      success: true,
      message: `Seeded ${result.insertedCount} coupons successfully.`,
      count: result.insertedCount,
    });
  } catch (error) {
    console.error("Coupon seed error:", error);
    return NextResponse.json({ error: "Unable to seed coupons." }, { status: 500 });
  }
}