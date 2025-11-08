const DEFAULT_HOURLY_RATE = Number(process.env.DEFAULT_HOURLY_RATE || 550);
const DEFAULT_MIN_HOURS = Number(process.env.DEFAULT_MIN_HOURS || 3);
const DEFAULT_OUTSTATION_FEE = process.env.DEFAULT_OUTSTATION_FEE
  ? Number(process.env.DEFAULT_OUTSTATION_FEE)
  : null;

export const calculateBookingBreakdown = ({
  ratePackage,
  hoursRequested,
  hourlyRate = DEFAULT_HOURLY_RATE,
  minimumHours = DEFAULT_MIN_HOURS,
  towingRequired = false,
}) => {
  const effectiveHours = Math.max(hoursRequested || minimumHours, minimumHours);
  let baseAmount = effectiveHours * hourlyRate;
  let packageLabel;

  if (ratePackage) {
    baseAmount = ratePackage.price;
    packageLabel = ratePackage.label;
  }

  const outstationFee = towingRequired
    ? DEFAULT_OUTSTATION_FEE !== null
      ? DEFAULT_OUTSTATION_FEE
      : 0
    : 0;

  const totalAmount = baseAmount + outstationFee;
  const depositAmount = Math.round(totalAmount * 0.5);

  return {
    baseAmount,
    totalAmount,
    depositAmount,
    hourlyRate,
    effectiveHours,
    packageLabel,
    outstationFee,
    requiresManualQuote: towingRequired && DEFAULT_OUTSTATION_FEE === null,
  };
};
