"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRoutes = void 0;
const booking_validation_1 = require("./booking.validation");
const validateRequest_1 = require("./../../middlewares/validateRequest");
const checkAuth_1 = require("./../../middlewares/checkAuth");
const express_1 = __importDefault(require("express"));
const user_interface_1 = require("../user/user.interface");
const booking_controller_1 = require("./booking.controller");
const router = express_1.default.Router();
router.post("/", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), (0, validateRequest_1.validateRequest)(booking_validation_1.createBookingZodSchema), booking_controller_1.BookingController.createBooking);
router.get("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(booking_validation_1.createBookingZodSchema), booking_controller_1.BookingController.getAllBookings);
router.get("/my-booking", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), (0, validateRequest_1.validateRequest)(booking_validation_1.createBookingZodSchema), booking_controller_1.BookingController.getUserBookings);
router.post("/:bookingId", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), (0, validateRequest_1.validateRequest)(booking_validation_1.createBookingZodSchema), booking_controller_1.BookingController.getSingleBooking);
router.post("/:bookingId/status", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), (0, validateRequest_1.validateRequest)(booking_validation_1.updateBookingStatusZodSchema), booking_controller_1.BookingController.updateBookingStatus);
exports.BookingRoutes = router;
