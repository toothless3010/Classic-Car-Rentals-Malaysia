import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import prisma from "../lib/prisma.js";
import asyncHandler from "../middleware/asyncHandler.js";

dayjs.extend(advancedFormat);

const index = asyncHandler(async (req, res) => {
  const [featuredCars, ratePackages, services, faqs, recentBookings] =
    await Promise.all([
      prisma.car.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      }),
      prisma.ratePackage.findMany({
        orderBy: { durationHours: "asc" },
      }),
      prisma.service.findMany({
        orderBy: { createdAt: "asc" },
      }),
      prisma.faq.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 6,
      }),
      prisma.booking.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          car: { select: { name: true, make: true, model: true } },
          ratePackage: { select: { label: true } },
        },
      }),
    ]);

  const upcomingSeason = dayjs().add(1, "month").format("MMMM YYYY");

  res.render("pages/home", {
    title: "Classic Car Rentals for Weddings & Events in Malaysia",
    featuredCars,
    ratePackages,
    services,
    faqs,
    recentBookings,
    upcomingSeason,
  });
});

export default {
  index,
};
