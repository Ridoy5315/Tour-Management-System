import { sendResponse } from './../../utils/sendResponse';
import { Request, Response } from 'express';
import { catchAsync } from './../../utils/catchAsync';
import { JwtPayload } from 'jsonwebtoken';
import { BookingService } from './booking.service';



const createBooking = catchAsync(async(req: Request, res: Response) => {
     const decodeToken = req.user as JwtPayload;
     const booking =await BookingService.createBooking(req.body, decodeToken.userId)
     sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: booking,
    });
})

const getUserBookings = catchAsync(async(req: Request, res: Response) => {
     const booking = await BookingService.getUserBookings();

     sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking retrieved successfully",
        data: booking,
    });
})

const getAllBookings = catchAsync(async(req: Request, res: Response) => {
      await BookingService.getAllBookings();
       sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking retrieved successfully",
        data: {},
    });
})

const getSingleBooking = catchAsync(async(req: Request, res: Response) => {
     const booking = await BookingService.getBookingById();
     sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking retrieved successfully",
        data: booking,
    });
})

const updateBookingStatus = catchAsync(async(req: Request, res: Response) => {
     const updated = await BookingService.updateBookingStatus();
     sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking retrieved successfully",
        data: updated,
    });
})


export const BookingController = {
     createBooking,
     getUserBookings,
     getAllBookings,
     getSingleBooking,
     updateBookingStatus
}