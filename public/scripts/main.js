(() => {
  const currencyFormatter = new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
  });

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(() => {
    const navToggle = document.querySelector(".nav-toggle");
    const primaryNav = document.querySelector(".primary-nav");

    if (navToggle && primaryNav) {
      navToggle.addEventListener("click", () => {
        const expanded = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", String(!expanded));
        primaryNav.classList.toggle("is-open");
      });
    }

    const galleryThumbs = document.querySelectorAll(".gallery-thumbs .thumb");
    const galleryItems = document.querySelectorAll(".gallery-item");
    if (galleryThumbs.length && galleryItems.length) {
      galleryThumbs.forEach((thumb) => {
        thumb.addEventListener("click", () => {
          const index = Number(thumb.dataset.imageIndex);
          galleryItems.forEach((item, itemIndex) => {
            item.classList.toggle("is-active", itemIndex === index);
          });
          galleryThumbs.forEach((button) =>
            button.classList.toggle("is-active", button === thumb)
          );
        });
      });
    }

      const bookingForm = document.querySelector(".booking-form");
      const summary = document.querySelector("[data-summary]");

      if (bookingForm && summary) {
        const ratePackages = JSON.parse(
          bookingForm.dataset.ratePackages || "[]"
        );
        const defaultHourlyRate = Number(bookingForm.dataset.hourlyRate || 550);
        const defaultMinHours = Number(bookingForm.dataset.minHours || 3);
        const outstationFeeConfigured = bookingForm.dataset.outstationFee
          ? Number(bookingForm.dataset.outstationFee)
          : null;

        const packageSelect = bookingForm.querySelector("#ratePackageId");
        const hoursInput = bookingForm.querySelector("#hoursRequested");
        const towingCheckbox = bookingForm.querySelector("#towingRequired");

        const summaryFields = {
          duration: summary.querySelector("[data-summary-duration]"),
          baseAmount: summary.querySelector("[data-summary-base]"),
          outstation: summary.querySelector("[data-summary-outstation]"),
          deposit: summary.querySelector("[data-summary-deposit]"),
          total: summary.querySelector("[data-summary-total]"),
          note: summary.querySelector("[data-summary-note]"),
        };

        const updateSummary = () => {
          const selectedPackageId = packageSelect?.value;
          const selectedPackage = ratePackages.find(
            (rate) => String(rate.id) === String(selectedPackageId)
          );
          const hours =
            Number(hoursInput?.value) ||
            selectedPackage?.durationHours ||
            defaultMinHours;
          const effectiveHours = Math.max(hours, defaultMinHours);

          let baseAmount = effectiveHours * defaultHourlyRate;
          let label = `${effectiveHours} hours (custom)`;

          if (selectedPackage) {
            baseAmount = selectedPackage.price;
            label = selectedPackage.label;
            if (hoursInput && !hoursInput.value) {
              hoursInput.value = selectedPackage.durationHours;
            }
          }

          const requiresOutstation = towingCheckbox?.checked ?? false;
          const outstationEstimate =
            requiresOutstation && typeof outstationFeeConfigured === "number"
              ? outstationFeeConfigured
              : 0;

          const total = baseAmount + outstationEstimate;
          const deposit = Math.round(total * 0.5);

          summaryFields.duration.textContent = label;
          summaryFields.baseAmount.textContent =
            currencyFormatter.format(baseAmount);
          summaryFields.total.textContent = currencyFormatter.format(total);
          summaryFields.deposit.textContent = currencyFormatter.format(deposit);

          if (requiresOutstation && outstationEstimate === 0) {
            summaryFields.outstation.textContent = "To be confirmed";
            summaryFields.note.textContent =
              "Outstation towing fees will be confirmed by our concierge.";
          } else if (requiresOutstation) {
            summaryFields.outstation.textContent =
              currencyFormatter.format(outstationEstimate);
            summaryFields.note.textContent =
              "Includes estimated towing fee. Final amount confirmed after itinerary review.";
          } else {
            summaryFields.outstation.textContent =
              currencyFormatter.format(0);
            summaryFields.note.textContent =
              "Select a package or enter hours to see your estimated investment.";
          }
        };

        ["change", "input"].forEach((eventName) => {
          bookingForm.addEventListener(eventName, updateSummary);
        });

        updateSummary();
      }
    });
  })();
