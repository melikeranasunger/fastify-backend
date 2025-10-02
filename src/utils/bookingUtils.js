// src/utils/bookingUtils.js
async function isBookingOverlapping(prisma, roomId, startTime, endTime) {
  const overlappingBooking = await prisma.booking.findFirst({
    where: {
      roomId,
      AND: [
        { startTime: { lt: new Date(endTime) } },
        { endTime: { gt: new Date(startTime) } },
      ],
    },
  });

  return !!overlappingBooking;
}

module.exports = {
  isBookingOverlapping,
};

