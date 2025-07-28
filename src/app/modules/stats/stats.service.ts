import { Payment } from './../payment/payment.model';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Booking } from "./../booking/booking.model";
import { Tour } from "./../tour/tour.model";
import { IsActive } from "../user/user.interface";
import { User } from "../user/user.model";
import { PAYMENT_STATUS } from '../payment/payment.interface';

const now = new Date();
const dateOfSevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const dateOfThirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);

const getUserStats = async () => {
  const totalUsersPromise = User.countDocuments();

  const totalActiveUsersPromise = User.countDocuments({
    isActive: IsActive.ACTIVE,
  });
  const totalInActiveUsersPromise = User.countDocuments({
    isActive: IsActive.INACTIVE,
  });
  const totalBlockedUsersPromise = User.countDocuments({
    isActive: IsActive.BLOCKED,
  });

  const newUsersInLast7DaysPromise = User.countDocuments({
    createdAt: { $gte: dateOfSevenDaysAgo },
  });
  const newUsersInLast30DaysPromise = User.countDocuments({
    createdAt: { $gte: dateOfThirtyDaysAgo },
  });

  const usersByRolePromise = User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  const [
    totalUsers,
    totalActiveUsers,
    totalInActiveUsers,
    totalBlockedUsers,
    newUsersInLast7Days,
    newUsersInLast30Days,
    usersByRole,
  ] = await Promise.all([
    totalUsersPromise,
    totalActiveUsersPromise,
    totalInActiveUsersPromise,
    totalBlockedUsersPromise,
    newUsersInLast7DaysPromise,
    newUsersInLast30DaysPromise,
    usersByRolePromise,
  ]);
  return {
    totalUsers,
    totalActiveUsers,
    totalInActiveUsers,
    totalBlockedUsers,
    newUsersInLast7Days,
    newUsersInLast30Days,
    usersByRole,
  };
};

const getTourStats = async () => {
  const totalTourPromise = Tour.countDocuments();

  //   await Tour.updateMany(
  //     {
  //       $or: [
  //         { tourType: { $type: "string" } },
  //         { division: { $type: "string" } },
  //       ],
  //     },
  //     [
  //       {
  //         $set: {
  //           tourType: { $toObjectId: "$tourType" },
  //           division: { $toObjectId: "$division" },
  //         },
  //       },
  //     ]
  //   );

  const totalTourByTourTypePromise = Tour.aggregate([
    {
      $lookup: {
        from: "tourtypes",
        localField: "tourType",
        foreignField: "_id",
        as: "type",
      },
    },
    {
      $unwind: "$type",
    },
    {
      $group: {
        _id: "$type.name",
        count: { $sum: 1 },
      },
    },
  ]);

  const avgTourCostPromise = Tour.aggregate([
    {
      $group: {
        _id: null,
        avgCostFrom: { $avg: "$costFrom" },
      },
    },
  ]);

  const totalTourByDivisionPromise = Tour.aggregate([
    {
      $lookup: {
        from: "divisions",
        localField: "division",
        foreignField: "_id",
        as: "Division",
      },
    },
    {
      $unwind: "$Division",
    },
    {
      $group: {
        _id: "$Division.name",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalHighestBookedTourPromise = Booking.aggregate([
    {
      $group: {
        _id: "$tour",
        bookingCount: { $sum: 1 },
      },
    },
    {
      $sort: { bookingCount: -1 },
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: "tours",
        let: { tourId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$tourId"] },
            },
          },
        ],
        as: "tour",
      },
    },
    {
      $unwind: "$tour",
    },
    {
      $project: {
        bookingCount: 1,
        "tour.title": 1,
        "tour.slug": 1,
      },
    },
  ]);

  const [
    totalTour,
    totalTourByTourType,
    avgTourCost,
    totalTourByDivision,
    totalHighestBookedTour,
  ] = await Promise.all([
    totalTourPromise,
    totalTourByTourTypePromise,
    avgTourCostPromise,
    totalTourByDivisionPromise,
    totalHighestBookedTourPromise,
  ]);
  return {
    totalTour,
    totalTourByTourType,
    avgTourCost,
    totalTourByDivision,
    totalHighestBookedTour,
  };
};

const getBookingStats = async () => {
  const totalBookingPromise = Booking.countDocuments();

  const totalBookingByStatusPromise = Booking.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const bookingsPerTourPromise = Booking.aggregate([
    {
      $group: {
        _id: "$tour",
        bookingCount: { $sum: 1 },
      },
    },
    {
      $sort: { bookingCount: -1 },
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: "tours",
        localField: "_id",
        foreignField: "_id",
        as: "tour",
      },
    },
    {
      $unwind: "$tour",
    },
    {
      $project: {
        bookingCount: 1,
        _id: 1,
        "tour.title": 1,
        "tour.slug": 1,
      },
    },
  ]);

  const avgGuestCountPerBookingPromise = Booking.aggregate([
    {
      $group: {
        _id: null,
        avgGuestCount: { $avg: "$guestCount" },
      },
    },
  ]);

  const bookingsLast7daysPromise = Booking.countDocuments({
    createdAt: { $gte: dateOfSevenDaysAgo },
  });
  const bookingsLast30daysPromise = Booking.countDocuments({
    createdAt: { $gte: dateOfThirtyDaysAgo },
  });

  const totalBookingsByUniqueUsersPromise = Booking.distinct("user").then(
    (user: any) => user.length
  );

  const [
    totalBooking,
    totalBookingByStatus,
    bookingsPerTour,
    avgGuestCountPerBooking,
    bookingsLast7days,
    bookingsLast30days,
    totalBookingsByUniqueUsers,
  ] = await Promise.all([
    totalBookingPromise,
    totalBookingByStatusPromise,
    bookingsPerTourPromise,
    avgGuestCountPerBookingPromise,
    bookingsLast7daysPromise,
    bookingsLast30daysPromise,
    totalBookingsByUniqueUsersPromise,
  ]);
  return {
    totalBooking,
    totalBookingByStatus,
    bookingsPerTour,
    avgGuestCountPerBooking : avgGuestCountPerBooking[0].avgGuestCount,
    bookingsLast7days,
    bookingsLast30days,
    totalBookingsByUniqueUsers,
  };
};

const getPaymentStats = async () => {
  const totalPaymentPromise = Payment.countDocuments()

  const totalPaymentByStatusPromise = Payment.aggregate([
    {
      $group: {
        _id: "$status",
        count: {$sum : 1}
      }
    }
  ])

  const totalRevenuePromise = Payment.aggregate([
    {
      $match: {status: PAYMENT_STATUS.PAID}
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount"}
      }
    }
  ])

  const avgPaymentAmountPromise = Payment.aggregate([
    {
      $group: {
        _id: null,
        avgPaymentAmount: {$avg: "$amount"}
      }
    }
  ])

  const paymentGatewayDataPromise = Payment.aggregate([
    {
      $group: {
        _id: {$ifNull: ["$paymentGatewayData.status", "UNKNOWN"]},
        count: {$sum: 1}
      }
    }
  ])

  const [totalPayment, totalPaymentByStatus, totalRevenue, avgPaymentAmount, paymentGatewayData ] = await Promise.all([
    totalPaymentPromise,
    totalPaymentByStatusPromise,
    totalRevenuePromise,
    avgPaymentAmountPromise,
    paymentGatewayDataPromise
    
  ])
  return {
    totalPayment,
    totalPaymentByStatus,
    totalRevenue,
    avgPaymentAmount,
    paymentGatewayData
  };
};

export const StatsService = {
  getUserStats,
  getBookingStats,
  getPaymentStats,
  getTourStats,
};
