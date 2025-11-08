import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

const toSlug = (text) =>
  slugify(text, {
    lower: true,
    strict: true,
  });

const ratePackagesData = [
  {
    label: "3-Hour City Celebration",
    slug: "3-hour-city-celebration",
    durationHours: 3,
    price: 1500,
    description:
      "Perfect for akad nikah ceremonies, ROM sessions, and intimate shoots around Kuala Lumpur or Petaling Jaya.",
  },
  {
    label: "6-Hour Signature Wedding",
    slug: "6-hour-signature-wedding",
    durationHours: 6,
    price: 2200,
    description:
      "Ideal for ceremony plus reception transfers, complete with chauffeur standby and photo opportunities.",
  },
  {
    label: "9-Hour Full Day Experience",
    slug: "9-hour-full-day-experience",
    durationHours: 9,
    price: 3000,
    description:
      "Covers multi-venue weddings, reunion dinners, and video productions requiring multiple takes.",
  },
  {
    label: "12-Hour Production Elite",
    slug: "12-hour-production-elite",
    durationHours: 12,
    price: 3500,
    description:
      "For commercials, films, and VIP itineraries needing extended coverage with multiple pit stops.",
  },
];

const servicesData = [
  {
    title: "Classic Car Rentals for Weddings & Events",
    slug: "classic-car-rentals-for-events",
    summary:
      "Chauffeur-driven classics tailored for weddings, akad nikah ceremonies, launches, and red-carpet arrivals.",
    description: [
      "Select from a curated fleet of collector-owned classics maintained to concours standards. Every booking includes a professionally trained chauffeur, ribbon decor, and itinerary coordination with your planner or venue.",
      "We brief chauffeurs on cultural protocols, photography angles, and schedule buffers so your day runs flawlessly. Need backup options? Our concierge prepares alternative vehicles and weather plans upon request.",
    ].join("\n\n"),
  },
  {
    title: "Production, Film, and Photoshoot Support",
    slug: "production-film-and-photoshoot-support",
    summary:
      "On-set transport, hero vehicles, and styling assistance for commercials, fashion editorials, and music videos.",
    description: [
      "Partner with us for prop sourcing, continuity planning, and on-site wranglers who understand director cues. We coordinate safe positioning, lighting considerations, and vehicle choreography for every shot.",
      "Need plates swapped or branding concealed? Our team handles the paperwork and rapid turnarounds so your creative vision shines without logistical delays.",
    ].join("\n\n"),
  },
  {
    title: "Buy & Sell Classic Cars",
    slug: "buy-and-sell-classic-cars",
    summary:
      "Connect with vetted collectors to acquire or consign heritage vehicles anywhere in Malaysia.",
    description: [
      "We advise on market valuations, inspection checklists, and restoration scopes before you make an offer. Benefit from our network of trusted workshops, financiers, and compliance partners.",
      "Consigning your vehicle? We produce high-quality media, handle inquiries, and manage test drives with qualified prospects while keeping your pride and joy protected.",
    ].join("\n\n"),
  },
  {
    title: "Insurance Renewal & Number Plate Services",
    slug: "insurance-renewal-and-number-plates",
    summary:
      "Comprehensive insurance renewals, road tax, and bespoke number plate sourcing for your classic car.",
    description: [
      "Classic insurance can be complex. We package policies that cover agreed values, limited mileage riders, and rally participation while maintaining JPJ compliance.",
      "Looking for an iconic plate? Tap into our database of premium numbers and let us handle transfers, documentation, and installation.",
    ].join("\n\n"),
  },
  {
    title: "Restoration & Repair Management",
    slug: "restoration-and-repair-management",
    summary:
      "Project manage restorations with trusted craftsmen for bodywork, interiors, and mechanical overhauls.",
    description: [
      "We scope your restoration goals, prepare budget-friendly phases, and match you with artisans specialising in your make and era. Expect photo updates, milestone check-ins, and quality assurance before delivery.",
      "From sourcing rare trim pieces to wiring upgrades for modern reliability, our partners balance originality with drivability to keep your car event-ready.",
    ].join("\n\n"),
  },
];

const faqsData = [
  {
    question: "How much deposit is required to secure a booking?",
    answer:
      "A 50% deposit is required to lock in your classic car. The balance is due 48 hours before your event or shoot date.",
    sortOrder: 1,
  },
  {
    question: "Can you support events outside of Klang Valley?",
    answer:
      "Yes. We coordinate towing and logistics nationwide. Share your venue details and we will quote the outstation surcharge.",
    sortOrder: 2,
  },
  {
    question: "Do you provide chauffeurs?",
    answer:
      "All rentals include a professional chauffeur vetted for classic vehicle handling, etiquette, and safety.",
    sortOrder: 3,
  },
  {
    question: "What documents are needed to list my car?",
    answer:
      "Provide a copy of the car grant, recent photos, and maintenance history. Our team will guide you through onboarding.",
    sortOrder: 4,
  },
  {
    question: "Can I customise ribbons or decor?",
    answer:
      "Absolutely. Bring your preferred colour palette or theme and we’ll coordinate installation before arrival.",
    sortOrder: 5,
  },
  {
    question: "Do you offer insurance renewal services?",
    answer:
      "Yes. We prepare quotes from classic-friendly insurers, handle paperwork, and can arrange inspections if needed.",
    sortOrder: 6,
  },
];

const socialLinksData = [
  {
    platform: "Facebook",
    url: "https://www.facebook.com/ccrmalaysia",
    handle: "@ccrmalaysia",
  },
  {
    platform: "Instagram",
    url: "https://www.instagram.com/classiccarrentalsmalaysia",
    handle: "@classiccarrentalsmalaysia",
  },
  {
    platform: "TikTok",
    url: "https://www.tiktok.com/@classiccarrentalsmy",
    handle: "@classiccarrentalsmy",
  },
];

const carsData = [
  {
    name: "1968 Mercedes-Benz W108 280S",
    make: "Mercedes-Benz",
    model: "W108 280S",
    year: 1968,
    engine: "2.8L Inline-6",
    displacementCc: 2778,
    transmission: "Automatic",
    seatingCapacity: 4,
    location: "Kuala Lumpur",
    hourlyRate: 550,
    minimumHours: 3,
    availabilityNote: "Based in Bangsar. Weekday evening and full weekend slots available.",
    shortDescription:
      "Ivory over tan leather with lavish chrome trim, perfect for sophisticated weddings and VIP transfers.",
    longDescription:
      "Arrive in Stuttgart elegance with this fully restored W108. The air-conditioned cabin keeps you cool in Malaysian weather, while the smooth 6-cylinder engine glides through city streets. Ribbon-ready and chauffeur maintained for ceremonies and photo opportunities.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80",
        altText: "Mercedes-Benz W108 classic wedding car in Malaysia",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80",
        altText: "Mercedes-Benz W108 interior detail",
      },
    ],
  },
  {
    name: "1971 Rolls-Royce Silver Shadow",
    make: "Rolls-Royce",
    model: "Silver Shadow",
    year: 1971,
    engine: "6.75L V8",
    displacementCc: 6749,
    transmission: "Automatic",
    seatingCapacity: 4,
    location: "Petaling Jaya",
    hourlyRate: 650,
    minimumHours: 3,
    availabilityNote: "Premium chauffeur attire included. Outstation requests require 14-day notice.",
    shortDescription:
      "Pearl white Rolls-Royce with lush navy interior, ideal for grand entrances and cinematic productions.",
    longDescription:
      "This Silver Shadow has served royalty and captains of industry. Meticulously detailed with signature Spirit of Ecstasy and polished burl wood accents. The suspension ensures a cloud-like ride while your photographer captures every angle.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1503735402780-27b82744075c?auto=format&fit=crop&w=1200&q=80",
        altText: "Rolls-Royce Silver Shadow exterior in Malaysia",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1563720223201-446fcf8305fb?auto=format&fit=crop&w=1200&q=80",
        altText: "Rolls-Royce Silver Shadow interior seating",
      },
    ],
  },
  {
    name: "1965 Ford Mustang Fastback",
    make: "Ford",
    model: "Mustang Fastback",
    year: 1965,
    engine: "4.7L V8",
    displacementCc: 4727,
    transmission: "Manual",
    seatingCapacity: 4,
    location: "Shah Alam",
    hourlyRate: 600,
    minimumHours: 3,
    availabilityNote: "Best suited for shoots and statement arrivals. Manual gearbox with experienced driver.",
    shortDescription:
      "Iconic Raven Black fastback with GT detailing, delivering muscle car drama for music videos and launches.",
    longDescription:
      "Turn heads with authentic American muscle. This Mustang Fastback features rally stripes, throaty exhaust note, and meticulously restored interior. Perfect for groomsmen convoys, product launches, and high-energy campaigns.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80&sat=-100",
        altText: "Ford Mustang fastback classic car in Malaysia",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1200&q=80",
        altText: "Ford Mustang detail shot for video production",
      },
    ],
  },
];

async function seedRatePackages() {
  for (const rate of ratePackagesData) {
    await prisma.ratePackage.upsert({
      where: { slug: rate.slug },
      update: {
        label: rate.label,
        durationHours: rate.durationHours,
        price: rate.price,
        description: rate.description,
      },
      create: rate,
    });
  }
}

async function seedServices() {
  for (const service of servicesData) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        title: service.title,
        summary: service.summary,
        description: service.description,
      },
      create: service,
    });
  }
}

async function seedFaqs() {
  for (const faq of faqsData) {
    await prisma.faq.upsert({
      where: { question: faq.question },
      update: {
        answer: faq.answer,
        sortOrder: faq.sortOrder,
        isActive: true,
      },
      create: faq,
    });
  }
}

async function seedSocialLinks() {
  for (const social of socialLinksData) {
    await prisma.socialLink.upsert({
      where: { platform: social.platform },
      update: {
        url: social.url,
        handle: social.handle,
      },
      create: social,
    });
  }
}

async function seedCars() {
  for (const car of carsData) {
    const { images, name, ...rest } = car;
    const slug = toSlug(name);
    await prisma.car.upsert({
      where: { slug },
      update: {
        ...rest,
        name,
        slug,
        images: {
          deleteMany: {},
          create: images.map((image, index) => ({
            ...image,
            isPrimary: index === 0 ? true : Boolean(image.isPrimary),
          })),
        },
      },
      create: {
        ...rest,
        name,
        slug,
        images: {
          create: images.map((image, index) => ({
            ...image,
            isPrimary: index === 0 ? true : Boolean(image.isPrimary),
          })),
        },
      },
    });
  }
}

async function main() {
  await seedRatePackages();
  await seedServices();
  await seedFaqs();
  await seedSocialLinks();
  await seedCars();
}

main()
  .then(async () => {
    console.log("Database seeded successfully.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seeding error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
