import asyncHandler from "../middleware/asyncHandler.js";
import prisma from "../lib/prisma.js";

const list = asyncHandler(async (req, res) => {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "asc" },
  });
  res.render("pages/services", {
    title: "Classic Car Services",
    services,
  });
});

const detail = asyncHandler(async (req, res) => {
  const service = await prisma.service.findUnique({
    where: { slug: req.params.slug },
  });

  if (!service) {
    res.status(404);
    res.render("pages/404", {
      title: "Service Not Found",
      message: "We couldn't find the service you're looking for.",
    });
    return;
  }

  res.render("pages/service-detail", {
    title: `${service.title} - Classic Car Rentals Malaysia`,
    service,
  });
});

const apiList = asyncHandler(async (req, res) => {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "asc" },
  });
  res.json(services);
});

export default {
  list,
  detail,
  apiList,
};
