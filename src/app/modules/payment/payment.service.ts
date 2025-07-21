import { Payment } from "./payment.model";
import { Booking } from "./../booking/booking.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { BOOKING_STATUS } from "../booking/booking.interface";

const successPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PAYMENT_STATUS.PAID },
      { runValidators: true, session }
    );

     await Booking.findOneAndUpdate(
      updatedPayment?.booking,
      { status: BOOKING_STATUS.COMPLETE }
    )

      await session.commitTransaction();
      session.endSession()
      return {
          success: true,
          message: "Payment Completed Successfully"
      }
  } catch (error) {
     await session.abortTransaction();
     session.endSession()
     throw error
  }
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

     await Booking.findOneAndUpdate(
      updatedPayment?.booking,
      { status: BOOKING_STATUS.FAILED }
    )

      await session.commitTransaction();
      session.endSession()
      return {
          success: false,
          message: "Payment Failed"
      }
  } catch (error) {
     await session.abortTransaction();
     session.endSession()
     throw error
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

     await Booking.findOneAndUpdate(
      updatedPayment?.booking,
      { status: BOOKING_STATUS.CANCEL }
    )

      await session.commitTransaction();
      session.endSession()
      return {
          success: false,
          message: "Payment cancelled"
      }
  } catch (error) {
     await session.abortTransaction();
     session.endSession()
     throw error
  }
};

export const PaymentService = {
  successPayment,
  failPayment,
  cancelPayment,
};
