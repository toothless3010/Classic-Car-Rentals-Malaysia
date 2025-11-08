import { Router } from "express";
import carController from "../controllers/carController.js";
import bookingController from "../controllers/bookingController.js";
import serviceController from "../controllers/serviceController.js";
import prisma from "../lib/prisma.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = Router();

router.get("/cars", carController.apiList);
router.get("/cars/:slug", carController.apiDetail);

router.get("/services", serviceController.apiList);

router.get(
  "/rate-packages",
  asyncHandler(async (req, res) => {
    const ratePackages = await prisma.ratePackage.findMany({
      orderBy: { durationHours: "asc" },
    });
    res.json(ratePackages);
  })
);

router.post("/bookings", bookingController.submitBooking);

export default router;
