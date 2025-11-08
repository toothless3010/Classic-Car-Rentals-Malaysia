import { Router } from "express";
import adminController from "../controllers/adminController.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();

router.get("/login", adminController.showLogin);
router.post("/login", adminController.handleLogin);
router.post("/logout", requireAdmin, adminController.logout);

router.get("/", requireAdmin, adminController.dashboard);

router.get("/cars", requireAdmin, adminController.listCars);
router.get("/cars/new", requireAdmin, adminController.newCarForm);
router.post("/cars", requireAdmin, adminController.createCar);
router.get("/cars/:id/edit", requireAdmin, adminController.editCarForm);
router.post("/cars/:id", requireAdmin, adminController.updateCar);
router.post("/cars/:id/delete", requireAdmin, adminController.deleteCar);

router.get("/bookings", requireAdmin, adminController.listBookings);
router.post("/bookings/:id/status", requireAdmin, adminController.updateBookingStatus);

router.get("/rate-packages", requireAdmin, adminController.listRatePackages);
router.post("/rate-packages", requireAdmin, adminController.createRatePackage);
router.post("/rate-packages/:id", requireAdmin, adminController.updateRatePackage);
router.post("/rate-packages/:id/delete", requireAdmin, adminController.deleteRatePackage);

router.get("/services", requireAdmin, adminController.listServices);
router.post("/services", requireAdmin, adminController.createService);
router.post("/services/:id", requireAdmin, adminController.updateService);
router.post("/services/:id/delete", requireAdmin, adminController.deleteService);

export default router;
