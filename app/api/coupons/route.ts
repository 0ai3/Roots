// app/api/coupons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { getDb } from "@/app/lib/mongo";

const COUPONS_COLLECTION = "coupons";
const REDEEMED_COUPONS_COLLECTION = "redeemed_coupons";
const PROFILE_COLLECTION = "profiles";

function buildUserFilters(userId: string) {
  const filters: Record<string, unknown>[] = [];
  if (ObjectId.isValid(userId)) {
    filters.push({ _id: new ObjectId(userId) });
  }
  filters.push({ userId });
  filters.push({ profileId: userId });
  return filters;
}

// Get all available coupons
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("roots_user")?.value?.trim();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const db = await getDb();
    
    // Get all coupons with remaining uses
    const coupons = await db
      .collection(COUPONS_COLLECTION)
      .find({ usesRemaining: { $gt: 0 } })
      .sort({ pointsCost: 1 })
      .toArray();

    // Get user's redeemed coupons
    const redeemedCoupons = await db
      .collection(REDEEMED_COUPONS_COLLECTION)
      .find({ 
        userId,
        expiresAt: { $gt: new Date() }
      })
      .toArray();

    // Get user's points
    const filters = buildUserFilters(userId);
    let userPoints = 0;
    for (const filter of filters) {
      const profile = await db.collection(PROFILE_COLLECTION).findOne(filter);
      if (profile) {
        userPoints = profile.points || 0;
        break;
      }
    }

    return NextResponse.json({
      coupons: coupons.map(c => ({
        ...c,
        _id: c._id.toString(),
      })),
      redeemedCoupons: redeemedCoupons.map(c => ({
        ...c,
        _id: c._id.toString(),
        couponId: c.couponId.toString(),
      })),
      userPoints,
    });
  } catch (error) {
    console.error("Coupons GET error:", error);
    return NextResponse.json({ error: "Unable to load coupons." }, { status: 500 });
  }
}

// Redeem a coupon
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("roots_user")?.value?.trim();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { couponId } = await request.json();

    if (!couponId || !ObjectId.isValid(couponId)) {
      return NextResponse.json({ error: "Invalid coupon ID." }, { status: 400 });
    }

    const db = await getDb();

    // Get coupon details
    const coupon = await db.collection(COUPONS_COLLECTION).findOne({
      _id: new ObjectId(couponId),
      usesRemaining: { $gt: 0 }
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not available." }, { status: 404 });
    }

    // Check user has enough points
    const filters = buildUserFilters(userId);
    let userProfile = null;
    for (const filter of filters) {
      const profile = await db.collection(PROFILE_COLLECTION).findOne(filter);
      if (profile) {
        userProfile = profile;
        break;
      }
    }

    if (!userProfile || (userProfile.points || 0) < coupon.pointsCost) {
      return NextResponse.json({ error: "Not enough points." }, { status: 400 });
    }

    // Create redemption
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const barcodeNumber = Math.random().toString().slice(2, 14); // 12 digit barcode

    const redemption: {
      userId: string;
      couponId: ObjectId;
      couponTitle: string;
      couponDiscount: string;
      couponCategory: string;
      barcode: string;
      redeemedAt: Date;
      expiresAt: Date;
      _id?: ObjectId;
    } = {
      userId,
      couponId: new ObjectId(couponId),
      couponTitle: coupon.title,
      couponDiscount: coupon.discount,
      couponCategory: coupon.category,
      barcode: barcodeNumber,
      redeemedAt: new Date(),
      expiresAt,
    };

    const insertResult = await db.collection(REDEEMED_COUPONS_COLLECTION).insertOne(redemption);
    if (insertResult.insertedId) {
      redemption._id = insertResult.insertedId;
    }

    // Decrease coupon uses
    await db.collection(COUPONS_COLLECTION).updateOne(
      { _id: new ObjectId(couponId) },
      { $inc: { usesRemaining: -1 } }
    );

    // Deduct points
    for (const filter of filters) {
      const updated = await db.collection(PROFILE_COLLECTION).findOneAndUpdate(
        filter,
        { $inc: { points: -coupon.pointsCost } },
        { returnDocument: "after" }
      );
      if (updated && updated.value) {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      redemption: {
        ...redemption,
        _id: redemption._id?.toString(),
        couponId: redemption.couponId.toString(),
      },
    });
  } catch (error) {
    console.error("Coupon redemption error:", error);
    return NextResponse.json({ error: "Unable to redeem coupon." }, { status: 500 });
  }
}