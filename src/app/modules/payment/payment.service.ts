import { sendEmail } from "./../../utils/sendEmail";
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { Payment } from "./payment.model";
import { Booking } from "./../booking/booking.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { BOOKING_STATUS } from "../booking/booking.interface";
import AppError from "../../errorHelpers/AppError";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { generatePdf, IInvoiceData } from "../../utils/invoice";
import { ITour } from "../tour/tour.interface";
import { IUser } from "../user/user.interface";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";
import { JwtPayload } from "jsonwebtoken";

const initPayment = async (bookingId: string) => {
  const payment = await Payment.findOne({ booking: bookingId });

  if (!payment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Payment not found. You have not booked this tour"
    );
  }

  const booking = await Booking.findById(payment.booking);

  const userAddress = (booking?.user as any).address;
  const userEmail = (booking?.user as any).email;
  const userPhoneNumber = (booking?.user as any).phone;
  const userName = (booking?.user as any).name;

  const sslPayload: ISSLCommerz = {
    name: userName,
    email: userEmail,
    address: userAddress,
    phoneNumber: userPhoneNumber,
    amount: payment.amount,
    transactionId: payment.transactionId,
  };

  const sslPayment = await SSLService.sslPaymentInit(sslPayload);

  return {
    payment: sslPayment.GatewayPageURL,
  };
};

const successPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PAYMENT_STATUS.PAID },
      { new: true, runValidators: true, session }
    );

    if (!updatedPayment) {
      throw new AppError(httpStatus.BAD_REQUEST, "Payment Not Found");
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      updatedPayment?.booking,
      { status: BOOKING_STATUS.COMPLETE },
      { new: true, runValidators: true, session }
    )
      .populate("tour", "title")
      .populate("user", "name email");

    if (!updatedBooking) {
      throw new AppError(httpStatus.BAD_REQUEST, "Booking Not Found");
    }

    const invoiceData: IInvoiceData = {
      bookingDate: updatedBooking.createdAt as Date,
      guestCount: updatedBooking.guestCount,
      totalAmount: updatedPayment.amount,
      tourTitle: (updatedBooking.tour as unknown as ITour).title,
      transactionId: updatedPayment.transactionId,
      userName: (updatedBooking.user as unknown as IUser).name,
    };

    const pdfBuffer = await generatePdf(invoiceData);

    const cloudinaryResult = await uploadBufferToCloudinary(
      pdfBuffer,
      "invoice"
    );

    if (!cloudinaryResult) {
      throw new AppError(httpStatus.BAD_REQUEST, "Error Uploading File");
    }

    await Payment.findByIdAndUpdate(
      updatedPayment._id,
      { invoiceUrl: cloudinaryResult.secure_url },
      { runValidators: true, session }
    );

    await sendEmail({
      to: (updatedBooking.user as unknown as IUser).email,
      subject: "Your Booking Invoice",
      templateName: "Invoice",
      templateData: invoiceData,
      attachments: [
        {
          filename: "invoice.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    await session.commitTransaction();
    session.endSession();
    return {
      success: true,
      message: "Payment Completed Successfully",
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getInvoiceDownloadUrl = async (paymentId: string, decodedToken: JwtPayload) => {
  const userId = decodedToken.userId;
  const email = decodedToken.email;
  console.log("from payment service",email)
  console.log("from payment service",userId)

  const payment = await Payment.findById(paymentId)
    .select("invoiceUrl booking")
    .populate({
      path: "booking",
      select: "user",
      populate: { path: "user", model: "User" },
    })
    .orFail(new Error("Payment Not Found"));

  if (!payment) {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment not found");
  }

  // Ensure booking is populated and has a user property
  const booking: any = payment.booking;
  const user = booking.user;
  if(!user){
    throw new AppError(httpStatus.BAD_REQUEST, "User not found");
  }
  console.log("from payment service",user)
  if((user._id).toString() !== userId){
    throw new AppError(httpStatus.BAD_REQUEST, "You are not authorized user");
  }
  // const user = payment.booking.user;

  if (!payment.invoiceUrl) {
    throw new AppError(httpStatus.BAD_REQUEST, "No Invoice Found");
  }

  return payment.invoiceUrl;
};

const failPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PAYMENT_STATUS.FAILED },
      { runValidators: true, session }
    );

    await Booking.findOneAndUpdate(updatedPayment?.booking, {
      status: BOOKING_STATUS.FAILED,
    });

    await session.commitTransaction();
    session.endSession();
    return {
      success: false,
      message: "Payment Failed",
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const cancelPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PAYMENT_STATUS.CANCELLED },
      { runValidators: true, session }
    );

    await Booking.findOneAndUpdate(updatedPayment?.booking, {
      status: BOOKING_STATUS.CANCEL,
    });

    await session.commitTransaction();
    session.endSession();
    return {
      success: false,
      message: "Payment cancelled",
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const PaymentService = {
  initPayment,
  successPayment,
  getInvoiceDownloadUrl,
  failPayment,
  cancelPayment,
};
