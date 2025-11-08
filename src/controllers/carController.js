import asyncHandler from "../middleware/asyncHandler.js";
import prisma from "../lib/prisma.js";

const buildFilters = (query) => {
  const filters = {};
  if (query.location) {
    filters.location = { contains: query.location, mode: "insensitive" };
  }
  if (query.search) {
    filters.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { make: { contains: query.search, mode: "insensitive" } },
      { model: { contains: query.search, mode: "insensitive" } },
    ];
  }
  return filters;
};

const list = asyncHandler(async (req, res) => {
  const filters = buildFilters(req.query);
  const [cars, ratePackages, totalCount] = await Promise.all([
    prisma.car.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          orderBy: { isPrimary: "desc" },
          take: 1,
        },
      },
    }),
    prisma.ratePackage.findMany({
      orderBy: { durationHours: "asc" },
    }),
    prisma.car.count({ where: filters }),
  ]);

  res.render("pages/fleet", {
    title: "Explore the Classic Car Fleet",
    cars,
    ratePackages,
    totalCount,
    query: req.query,
  });
});

const detail = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const car = await prisma.car.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { isPrimary: "desc" },
      },
    },
  });

  if (!car) {
    res.status(404);
    res.render("pages/404", {
      title: "Car Not Found",
      message: "We couldn't find the classic car you're looking for.",
    });
    return;
  }

  const relatedCars = await prisma.car.findMany({
    where: { id: { not: car.id } },
    take: 3,
    include: {
      images: {
        orderBy: { isPrimary: "desc" },
        take: 1,
      },
    },
  });

  res.render("pages/car-detail", {
    title: `${car.name} - Classic Car Rentals Malaysia`,
    car,
    relatedCars,
  });
});

const apiList = asyncHandler(async (req, res) => {
  const filters = buildFilters(req.query);
  const cars = await prisma.car.findMany({
    where: filters,
    orderBy: { createdAt: "desc" },
    include: {
      images: true,
    },
  });
  res.json(cars);
});

const apiDetail = asyncHandler(async (req, res) => {
  const car = await prisma.car.findUnique({
    where: { slug: req.params.slug },
    include: { images: true },
  });
  if (!car) {
    res.status(404).json({ error: "Car not found" });
    return;
  }
  res.json(car);
});

export default {
  list,
  detail,
  apiList,
  apiDetail,
};
