const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const getAllEvents = async (req, reply) => {
  const events = await prisma.event.findMany();
  reply.send(events);
};

const getEventById = async (req, reply) => {
  const id = parseInt(req.params.id);
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) {
    return reply.code(404).send({ message: 'Event bulunamadı' });
  }

  reply.send(event);
};

const createEvent = async (req, reply) => {
  const { title, description, date, roomId } = req.body;

  const newEvent = await prisma.event.create({
    data: { title, description, date: new Date(date), roomId }
  });

  reply.code(201).send(newEvent);
};

const updateEvent = async (req, reply) => {
  const id = parseInt(req.params.id);
  const { title, description, date, roomId } = req.body;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return reply.code(404).send({ message: 'Güncellenecek event bulunamadı' });
  }

  const updated = await prisma.event.update({
    where: { id },
    data: { title, description, date: new Date(date), roomId }
  });

  reply.send(updated);
};

const deleteEvent = async (req, reply) => {
  const id = parseInt(req.params.id);

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return reply.code(404).send({ message: 'Silinecek event bulunamadı' });
  }

  await prisma.event.delete({ where: { id } });
  reply.code(204).send();
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};

