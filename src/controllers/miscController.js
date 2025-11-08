import asyncHandler from "../middleware/asyncHandler.js";
import prisma from "../lib/prisma.js";

const contact = asyncHandler(async (req, res) => {
  const socialLinks = await prisma.socialLink.findMany({
    orderBy: { platform: "asc" },
  });
  res.render("pages/contact", {
    title: "Contact Classic Car Rentals Malaysia",
    socialLinks,
  });
});

const brand = (req, res) => {
  res.render("pages/brand", {
    title: "Brand Guidelines",
  });
};

export default {
  contact,
  brand,
};
