import slugify from "slugify";
import dayjs from "dayjs";
import { body, validationResult } from "express-validator";
import prisma from "../lib/prisma.js";

const ADMIN_DEFAULT_PASSWORD = "drive-classics";

const buildSlug = (value) =>
  slugify(value, {
    lower: true,
    strict: true,
  });

const authenticate = (password) => {
  const configured = process.env.ADMIN_PASSWORD;
  const expected = configured && configured.trim().length > 0 ? configured : ADMIN_DEFAULT_PASSWORD;
  return password === expected;
};

const flashErrors = (req, res, path, errors) => {
  const messages = Object.values(errors).map((err) => err.msg);
  if (messages.length) {
    req.flash("error", messages);
  }
  res.redirect(path);
  return false;
};

const showLogin = (req, res) => {
  if (req.session?.isAdmin) {
    res.redirect("/admin");
    return;
  }
  res.render("admin/login", {
    title: "Admin Login",
  });
};

const handleLogin = [
  body("password").trim().notEmpty().withMessage("Enter the admin password."),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array().map((err) => err.msg));
      res.redirect("/admin/login");
      return;
    }

    const { password } = req.body;
    if (!authenticate(password)) {
      req.flash("error", "Incorrect password. Please try again.");
      res.redirect("/admin/login");
      return;
    }

    req.session.isAdmin = true;
    req.flash("success", "Welcome back, admin.");
    res.redirect("/admin");
  },
];

const logout = (req, res) => {
  req.session.isAdmin = false;
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
};

const dashboard = async (req, res, next) => {
  try {
    const [carCount, bookingCount, pendingBookingCount, serviceCount, revenueAggregate, recentBookings] =
      await Promise.all([
        prisma.car.count(),
        prisma.booking.count(),
        prisma.booking.count({ where: { status: "PENDING" } }),
        prisma.service.count(),
        prisma.booking.aggregate({ _sum: { depositAmount: true } }),
        prisma.booking.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { car: { select: { name: true } }, ratePackage: { select: { label: true } } },
        }),
      ]);

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      stats: {
        carCount,
        bookingCount,
        pendingBookingCount,
        serviceCount,
        totalDeposit: revenueAggregate._sum.depositAmount || 0,
      },
      recentBookings: recentBookings.map((booking) => ({
        ...booking,
        createdAtFormatted: dayjs(booking.createdAt).format("DD MMM YYYY, HH:mm"),
        eventDateFormatted: dayjs(booking.eventDate).format("DD MMM YYYY"),
      })),
    });
  } catch (error) {
    next(error);
  }
};

const listCars = async (req, res, next) => {
  try {
    const cars = await prisma.car.findMany({
      orderBy: { createdAt: "desc" },
      include: { images: true, bookings: { select: { id: true } } },
    });
    res.render("admin/cars/index", {
      title: "Manage Cars",
      cars,
    });
  } catch (error) {
    next(error);
  }
};

const carValidations = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("make").trim().notEmpty().withMessage("Make is required."),
  body("model").trim().notEmpty().withMessage("Model is required."),
  body("hourlyRate")
    .optional({ values: "falsy" })
    .isInt({ min: 0 })
    .withMessage("Hourly rate must be a number."),
  body("minimumHours")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("Minimum hours must be at least 1."),
];

const parseImages = (rawText) => {
  if (!rawText) return [];
  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [url, altText] = line.split("|").map((part) => part.trim());
      return {
        url,
        altText: altText || null,
        isPrimary: index === 0,
      };
    });
};

const newCarForm = (req, res) => {
  res.render("admin/cars/form", {
    title: "Add Car",
    car: null,
  });
};

const createCar = [
  ...carValidations,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      flashErrors(req, res, "/admin/cars/new", errors.mapped());
      return;
    }
    try {
      const {
        name,
        make,
        model,
        year,
        engine,
        displacementCc,
        transmission,
        seatingCapacity,
        location,
        availabilityNote,
        shortDescription,
        longDescription,
        hourlyRate,
        minimumHours,
        imageUrls,
      } = req.body;

      const slug = buildSlug(`${name}-${make}-${model}`);
      const images = parseImages(imageUrls);

      await prisma.car.create({
        data: {
          name,
          make,
          model,
          slug,
          year: year ? Number(year) : null,
          engine,
          displacementCc: displacementCc ? Number(displacementCc) : null,
          transmission,
          seatingCapacity: seatingCapacity ? Number(seatingCapacity) : null,
          location,
          availabilityNote,
          shortDescription,
          longDescription,
          hourlyRate: hourlyRate ? Number(hourlyRate) : null,
          minimumHours: minimumHours ? Number(minimumHours) : null,
          images: {
            create: images,
          },
        },
      });

      req.flash("success", "Classic car added successfully.");
      res.redirect("/admin/cars");
    } catch (error) {
      next(error);
    }
  },
];

const editCarForm = async (req, res, next) => {
  try {
    const car = await prisma.car.findUnique({
      where: { id: Number(req.params.id) },
      include: { images: true },
    });
    if (!car) {
      req.flash("error", "Car not found.");
      res.redirect("/admin/cars");
      return;
    }
    res.render("admin/cars/form", {
      title: `Edit ${car.name}`,
      car,
      imagesText: car.images
        .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
        .map((img) => `${img.url}${img.altText ? `|${img.altText}` : ""}`)
        .join("\n"),
    });
  } catch (error) {
    next(error);
  }
};

const updateCar = [
  ...carValidations,
  async (req, res, next) => {
    const errors = validationResult(req);
    const carId = Number(req.params.id);
    if (!errors.isEmpty()) {
      flashErrors(req, res, `/admin/cars/${carId}/edit`, errors.mapped());
      return;
    }
    try {
      const {
        name,
        make,
        model,
        year,
        engine,
        displacementCc,
        transmission,
        seatingCapacity,
        location,
        availabilityNote,
        shortDescription,
        longDescription,
        hourlyRate,
        minimumHours,
        imageUrls,
      } = req.body;

      const images = parseImages(imageUrls);

      await prisma.car.update({
        where: { id: carId },
        data: {
          name,
          make,
          model,
          year: year ? Number(year) : null,
          engine,
          displacementCc: displacementCc ? Number(displacementCc) : null,
          transmission,
          seatingCapacity: seatingCapacity ? Number(seatingCapacity) : null,
          location,
          availabilityNote,
          shortDescription,
          longDescription,
          hourlyRate: hourlyRate ? Number(hourlyRate) : null,
          minimumHours: minimumHours ? Number(minimumHours) : null,
          images: {
            deleteMany: {},
            create: images,
          },
        },
      });

      req.flash("success", "Car updated successfully.");
      res.redirect("/admin/cars");
    } catch (error) {
      next(error);
    }
  },
];

const deleteCar = async (req, res, next) => {
  try {
    await prisma.car.delete({
      where: { id: Number(req.params.id) },
    });
    req.flash("success", "Car deleted.");
    res.redirect("/admin/cars");
  } catch (error) {
    next(error);
  }
};

const listBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        car: { select: { name: true } },
        ratePackage: { select: { label: true } },
      },
    });
    res.render("admin/bookings/index", {
      title: "Manage Bookings",
      bookings: bookings.map((booking) => ({
        ...booking,
        createdAtFormatted: dayjs(booking.createdAt).format("DD MMM YYYY, HH:mm"),
        eventDateFormatted: dayjs(booking.eventDate).format("DD MMM YYYY"),
      })),
    });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = [
  body("status").isIn(["PENDING", "CONFIRMED", "PAID", "COMPLETED", "CANCELLED"]).withMessage("Invalid status."),
  async (req, res, next) => {
    const bookingId = Number(req.params.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", "Please choose a valid status.");
      res.redirect("/admin/bookings");
      return;
    }
    try {
      const { status } = req.body;
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status },
      });
      req.flash("success", "Booking status updated.");
      res.redirect("/admin/bookings");
    } catch (error) {
      next(error);
    }
  },
];

const listRatePackages = async (req, res, next) => {
  try {
    const ratePackages = await prisma.ratePackage.findMany({
      orderBy: { durationHours: "asc" },
    });
    res.render("admin/rate-packages/index", {
      title: "Manage Rate Packages",
      ratePackages,
    });
  } catch (error) {
    next(error);
  }
};

const ratePackageValidations = [
  body("label").trim().notEmpty().withMessage("Label is required."),
  body("durationHours").isInt({ min: 1 }).withMessage("Duration must be at least 1 hour."),
  body("price").isInt({ min: 0 }).withMessage("Price must be a positive value."),
];

const createRatePackage = [
  ...ratePackageValidations,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      flashErrors(req, res, "/admin/rate-packages", errors.mapped());
      return;
    }
    try {
      const { label, durationHours, price, description } = req.body;
      await prisma.ratePackage.create({
        data: {
          label,
          durationHours: Number(durationHours),
          price: Number(price),
          description,
          slug: buildSlug(label),
        },
      });
      req.flash("success", "Rate package created.");
      res.redirect("/admin/rate-packages");
    } catch (error) {
      next(error);
    }
  },
];

const updateRatePackage = [
  ...ratePackageValidations,
  async (req, res, next) => {
    const errors = validationResult(req);
    const ratePackageId = Number(req.params.id);
    if (!errors.isEmpty()) {
      flashErrors(req, res, "/admin/rate-packages", errors.mapped());
      return;
    }
    try {
      const { label, durationHours, price, description } = req.body;
      await prisma.ratePackage.update({
        where: { id: ratePackageId },
        data: {
          label,
          durationHours: Number(durationHours),
          price: Number(price),
          description,
        },
      });
      req.flash("success", "Rate package updated.");
      res.redirect("/admin/rate-packages");
    } catch (error) {
      next(error);
    }
  },
];

const deleteRatePackage = async (req, res, next) => {
  try {
    await prisma.ratePackage.delete({
      where: { id: Number(req.params.id) },
    });
    req.flash("success", "Rate package deleted.");
    res.redirect("/admin/rate-packages");
  } catch (error) {
    next(error);
  }
};

const listServices = async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { title: "asc" },
    });
    res.render("admin/services/index", {
      title: "Manage Services",
      services,
    });
  } catch (error) {
    next(error);
  }
};

const serviceValidations = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("summary").trim().notEmpty().withMessage("Summary is required."),
  body("description").trim().notEmpty().withMessage("Description cannot be empty."),
];

const createService = [
  ...serviceValidations,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      flashErrors(req, res, "/admin/services", errors.mapped());
      return;
    }
    try {
      const { title, summary, description, icon } = req.body;
      await prisma.service.create({
        data: {
          title,
          summary,
          description,
          icon,
          slug: buildSlug(title),
        },
      });
      req.flash("success", "Service created.");
      res.redirect("/admin/services");
    } catch (error) {
      next(error);
    }
  },
];

const updateService = [
  ...serviceValidations,
  async (req, res, next) => {
    const errors = validationResult(req);
    const serviceId = Number(req.params.id);
    if (!errors.isEmpty()) {
      flashErrors(req, res, "/admin/services", errors.mapped());
      return;
    }
    try {
      const { title, summary, description, icon } = req.body;
      await prisma.service.update({
        where: { id: serviceId },
        data: {
          title,
          summary,
          description,
          icon,
        },
      });
      req.flash("success", "Service updated.");
      res.redirect("/admin/services");
    } catch (error) {
      next(error);
    }
  },
];

const deleteService = async (req, res, next) => {
  try {
    await prisma.service.delete({
      where: { id: Number(req.params.id) },
    });
    req.flash("success", "Service deleted.");
    res.redirect("/admin/services");
  } catch (error) {
    next(error);
  }
};

export default {
  showLogin,
  handleLogin,
  logout,
  dashboard,
  listCars,
  newCarForm,
  createCar,
  editCarForm,
  updateCar,
  deleteCar,
  listBookings,
  updateBookingStatus,
  listRatePackages,
  createRatePackage,
  updateRatePackage,
  deleteRatePackage,
  listServices,
  createService,
  updateService,
  deleteService,
};
