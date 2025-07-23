const t = require('tap');
const sinon = require('sinon');
const { PrismaClient } = require('@prisma/client');
const { isBookingOverlapping } = require('../src/utils/bookingUtils');

const prisma = new PrismaClient();

t.test('isBookingOverlapping fonksiyonu doğru sonuç döndürmeli', async (t) => {
  const stub = sinon.stub(prisma.booking, 'findFirst');

  // 1. Çakışma VAR
  stub.resolves({ id: 1 });
  const result1 = await isBookingOverlapping(
    prisma,
    1,
    '2025-07-01T10:00:00.000Z',
    '2025-07-01T11:00:00.000Z'
  );
  t.equal(result1, true, 'Çakışan rezervasyon varsa true dönmeli');

  // 2. Çakışma YOK
  stub.resolves(null);
  const result2 = await isBookingOverlapping(
    prisma,
    1,
    '2025-07-01T12:00:00.000Z',
    '2025-07-01T13:00:00.000Z'
  );
  t.equal(result2, false, 'Çakışma yoksa false dönmeli');

  stub.restore();
});
