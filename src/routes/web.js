import { Router } from "express";
import homeController from "../controllers/homeController.js";
import carController from "../controllers/carController.js";
import bookingController from "../controllers/bookingController.js";
import serviceController from "../controllers/serviceController.js";
import miscController from "../controllers/miscController.js";

const router = Router();

router.get("/", homeController.index);

router.get("/fleet", carController.list);
router.get("/cars/:slug", carController.detail);

router.get("/services", serviceController.list);
router.get("/services/:slug", serviceController.detail);

router.get("/booking", bookingController.showForm);
router.post("/booking", bookingController.submitBooking);
router.get("/booking/confirmation", bookingController.showConfirmation);

router.get("/contact", miscController.contact);
router.get("/brand", miscController.brand);

export default router;
