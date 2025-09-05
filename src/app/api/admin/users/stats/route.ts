import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/database/mongodb";

// GET /api/admin/users/stats - Get user statistics
export async function GET(request: NextRequest) {
  try {
    const usersCollection = await getCollection("users");
    const violationsCollection = await getCollection("violations");
    
    // Get total users count
    const totalUsers = await usersCollection.countDocuments({});
    
    // Get users by status
    const activeUsers = await usersCollection.countDocuments({ status: "active" });
    const suspendedUsers = await usersCollection.countDocuments({ status: "suspended" });
    const inactiveUsers = await usersCollection.countDocuments({ status: "inactive" });
    
    // Get users by verification status
    const emailVerifiedUsers = await usersCollection.countDocuments({ emailVerified: true });
    const phoneVerifiedUsers = await usersCollection.countDocuments({ phoneVerified: true });
    
    // Get users by role
    const regularUsers = await usersCollection.countDocuments({ role: "user" });
    const adminUsers = await usersCollection.countDocuments({ role: "admin" });
    const superAdminUsers = await usersCollection.countDocuments({ role: "super_admin" });
    
    // Get users with violations
    const usersWithViolations = await violationsCollection.distinct("userId");
    const usersWithoutViolations = totalUsers - usersWithViolations.length;
    
    // Get users with outstanding fines
    const usersWithOutstandingFines = await violationsCollection.distinct("userId", {
      paymentStatus: { $ne: "paid" }
    });
    
    // Get registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await usersCollection.countDocuments({
      createdAt: { $gte: thirtyDaysAgo.toISOString() }
    });
    
    // Get last 7 days registrations
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const lastWeekRegistrations = await usersCollection.countDocuments({
      createdAt: { $gte: sevenDaysAgo.toISOString() }
    });
    
    // Get today's registrations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRegistrations = await usersCollection.countDocuments({
      createdAt: { $gte: today.toISOString() }
    });
    
    // Get users by registration month (last 12 months)
    const monthlyRegistrations = [];
    for (let i = 11; i >= 0; i--) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - i);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      
      const count = await usersCollection.countDocuments({
        createdAt: {
          $gte: startDate.toISOString(),
          $lt: endDate.toISOString()
        }
      });
      
      monthlyRegistrations.push({
        month: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count
      });
    }
    
    // Get top users by violation count
    const topViolators = await violationsCollection.aggregate([
      {
        $group: {
          _id: "$userId",
          violationCount: { $sum: 1 },
          totalFines: { $sum: "$fine" }
        }
      },
      {
        $sort: { violationCount: -1 }
      },
      {
        $limit: 10
      }
    ]).toArray();
    
    // Enrich top violators with user details
    const enrichedTopViolators = await Promise.all(
      topViolators.map(async (violator) => {
        const user = await usersCollection.findOne({ id: violator._id });
        return {
          userId: violator._id,
          userName: user?.name || "Unknown User",
          userEmail: user?.email || "Unknown Email",
          violationCount: violator.violationCount,
          totalFines: violator.totalFines
        };
      })
    );
    
    // Get users by number plate format (if available)
    const usersWithNumberPlates = await usersCollection.countDocuments({
      numberPlate: { $exists: true, $ne: "" }
    });
    
    const usersWithoutNumberPlates = totalUsers - usersWithNumberPlates;
    
    // Calculate percentages
    const activePercentage = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0;
    const suspendedPercentage = totalUsers > 0 ? ((suspendedUsers / totalUsers) * 100).toFixed(1) : 0;
    const inactivePercentage = totalUsers > 0 ? ((inactiveUsers / totalUsers) * 100).toFixed(1) : 0;
    const emailVerifiedPercentage = totalUsers > 0 ? ((emailVerifiedUsers / totalUsers) * 100).toFixed(1) : 0;
    const phoneVerifiedPercentage = totalUsers > 0 ? ((phoneVerifiedUsers / totalUsers) * 100).toFixed(1) : 0;
    const usersWithViolationsPercentage = totalUsers > 0 ? ((usersWithViolations.length / totalUsers) * 100).toFixed(1) : 0;
    const usersWithOutstandingFinesPercentage = totalUsers > 0 ? ((usersWithOutstandingFines.length / totalUsers) * 100).toFixed(1) : 0;
    
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          suspendedUsers,
          inactiveUsers,
          activePercentage,
          suspendedPercentage,
          inactivePercentage
        },
        verification: {
          emailVerifiedUsers,
          phoneVerifiedUsers,
          emailVerifiedPercentage,
          phoneVerifiedPercentage
        },
        roles: {
          regularUsers,
          adminUsers,
          superAdminUsers
        },
        violations: {
          usersWithViolations: usersWithViolations.length,
          usersWithoutViolations,
          usersWithOutstandingFines: usersWithOutstandingFines.length,
          usersWithViolationsPercentage,
          usersWithOutstandingFinesPercentage
        },
        registration: {
          recentRegistrations,
          lastWeekRegistrations,
          todayRegistrations,
          monthlyRegistrations
        },
        numberPlates: {
          usersWithNumberPlates,
          usersWithoutNumberPlates
        },
        topViolators: enrichedTopViolators
      }
    });
    
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}
