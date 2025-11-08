import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { body, validationResult } from "express-validator";
import prisma from "../lib/prisma.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { calculateBookingBreakdown } from "../lib/booking.js";

dayjs.extend(customParseFormat);

const bookingValidations = [
  body("customerName").trim().notEmpty().withMessage("Please provide your full name."),
  body("email").isEmail().withMessage("Enter a valid email address."),
  body("phone").trim().notEmpty().withMessage("Let us know the best number to reach you."),
  body("eventDate")
    .notEmpty()
    .withMessage("Select the date you need the car.")
    .bail()
    .custom((value) => {
      const parsed = dayjs(value, ["YYYY-MM-DD"], true);
      if (!parsed.isValid()) {
        throw new Error("Provide a valid date.");
      }
      if (parsed.isBefore(dayjs(), "day")) {
        throw new Error("Booking date must be today or later.");
      }
      return true;
    }),
  body("hoursRequested")
    .optional({ values: "falsy" })
    .isInt({ min: 1, max: 24 })
    .withMessage("Hours requested should be between 1 and 24."),
  body("carId")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("Select a valid car."),
  body("ratePackageId")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("Choose a valid rate package."),
];

const getFormData = async () => {
  const [cars, ratePackages, faqs] = await Promise.all([
    prisma.car.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.ratePackage.findMany({
      orderBy: { durationHours: "asc" },
    }),
    prisma.faq.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);
  return { cars, ratePackages, faqs };
};

const showForm = asyncHandler(async (req, res) => {
  const data = await getFormData();
  res.render("pages/booking", {
    title: "Book a Classic Car",
    ...data,
    formValues: {},
    errors: {},
    quote: null,
  });
});

const submitBooking = [
  ...bookingValidations,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const mappedErrors = errors.mapped();

    if (!errors.isEmpty()) {
      if (req.originalUrl.startsWith("/api")) {
        res.status(422).json({
          message: "Please correct the highlighted fields.",
          errors: mappedErrors,
        });
        return;
      }

      const { cars, ratePackages, faqs } = await getFormData();
      res.status(422);
      res.render("pages/booking", {
        title: "Book a Classic Car",
        cars,
        ratePackages,
        faqs,
        formValues: req.body,
        errors: mappedErrors,
        quote: null,
      });
      return;
    }

    const {
      customerName,
      email,
      phone,
      eventType,
      eventDate,
      location,
      towingRequired,
      notes,
      hoursRequested,
      carId,
      ratePackageId,
    } = req.body;

    const parsedEventDate = dayjs(eventDate, "YYYY-MM-DD").toDate();
    const selectedCar = carId ? await prisma.car.findUnique({ where: { id: Number(carId) } }) : null;
    const selectedRatePackage = ratePackageId
      ? await prisma.ratePackage.findUnique({ where: { id: Number(ratePackageId) } })
      : null;

    const breakdown = calculateBookingBreakdown({
      ratePackage: selectedRatePackage ?? undefined,
      hoursRequested: Number(hoursRequested) || selectedRatePackage?.durationHours,
      hourlyRate: selectedCar?.hourlyRate || undefined,
      minimumHours: selectedCar?.minimumHours || undefined,
      towingRequired: towingRequired === "on",
    });

    const booking = await prisma.booking.create({
      data: {
        customerName,
        email,
        phone,
        eventType,
        eventDate: parsedEventDate,
        location,
        towingRequired: towingRequired === "on",
        notes,
        hoursRequested: breakdown.effectiveHours,
        totalAmount: breakdown.totalAmount,
        depositAmount: breakdown.depositAmount,
        car: selectedCar ? { connect: { id: selectedCar.id } } : undefined,
        ratePackage: selectedRatePackage ? { connect: { id: selectedRatePackage.id } } : undefined,
      },
      include: {
        car: true,
        ratePackage: true,
      },
    });

    const responsePayload = {
      bookingId: booking.id,
      totalAmount: breakdown.totalAmount,
      depositAmount: breakdown.depositAmount,
      requiresManualQuote: breakdown.requiresManualQuote,
      paymentLink: process.env.STRIPE_PAYMENT_LINK || null,
    };

    if (req.originalUrl.startsWith("/api")) {
      res.status(201).json({
        message: "Booking request received. We'll reach out to confirm the details.",
        booking: responsePayload,
      });
      return;
    }

    const summaryLines = [
      `Booking reference: #${booking.id}`,
      breakdown.packageLabel
        ? `Package: ${breakdown.packageLabel}`
        : `Hours confirmed: ${breakdown.effectiveHours} hours`,
      `Total: ${req.app.locals.formatCurrency(breakdown.totalAmount)}`,
      `Deposit (50%): ${req.app.locals.formatCurrency(breakdown.depositAmount)}`,
    ];
    if (breakdown.outstationFee > 0) {
      summaryLines.push(
        `Includes outstation fee: ${req.app.locals.formatCurrency(breakdown.outstationFee)}`
      );
    }
    if (breakdown.requiresManualQuote) {
      summaryLines.push(
        "Outstation towing charges will be confirmed by our concierge team in the next step."
      );
    }
    if (process.env.STRIPE_PAYMENT_LINK) {
      summaryLines.push(
        "You can secure your booking now using our online payment link below."
      );
    }

    req.flash("success", summaryLines);
    res.redirect("/booking/confirmation?bookingId=" + booking.id);
  }),
];

const showConfirmation = asyncHandler(async (req, res) => {
  const bookingId = Number(req.query.bookingId);
  if (!bookingId) {
    res.redirect("/booking");
    return;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      car: true,
      ratePackage: true,
    },
  });

  if (!booking) {
    req.flash("error", "We couldn't find that booking reference. Please try again.");
    res.redirect("/booking");
    return;
  }

  res.render("pages/booking-confirmation", {
    title: "Booking Confirmation",
    booking,
    paymentLink: process.env.STRIPE_PAYMENT_LINK || null,
  });
});

export default {
  showForm,
  submitBooking,
  showConfirmation,
  bookingValidations,
};
