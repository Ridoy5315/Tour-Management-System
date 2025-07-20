import { createBookingZodSchema, updateBookingStatusZodSchema } from './booking.validation';
import { validateRequest } from './../../middlewares/validateRequest';
import { checkAuth } from './../../middlewares/checkAuth';
import express from 'express';
import { Role } from '../user/user.interface';
import { BookingController } from './booking.controller';


const router = express.Router();

router.post("/", checkAuth(...Object.values(Role)), validateRequest(createBookingZodSchema), BookingController.createBooking)

router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createBookingZodSchema), BookingController.getAllBookings)

router.get("/my-booking", checkAuth(...Object.values(Role)), validateRequest(createBookingZodSchema), BookingController.getUserBookings)

router.post("/:bookingId", checkAuth(...Object.values(Role)), validateRequest(createBookingZodSchema), BookingController.getSingleBooking)

router.post("/:bookingId/status", checkAuth(...Object.values(Role)), validateRequest(updateBookingStatusZodSchema), BookingController.updateBookingStatus)

export const BookingRoutes = router;