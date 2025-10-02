const { PrismaClient } = require('@prisma/client');
const verifyToken = require('../middlewares/verifyToken'); // Token kontrol middleware'i
const { request } = require('undici');
const prisma = new PrismaClient();

async function roomRoutes(fastify, options) {
  // Korumalı route: Oda oluşturma
  fastify.post('/rooms', { preHandler: verifyToken }, async (request, reply) => {
    try{
     const { name, capacity, location } = request.body;
      const newRoom = await prisma.room.create({
      data: { name, capacity, location },
    });
     return reply.code(201).send({
      mesaj: 'Oda başarıyla oluşturuldu.',
      oda: newRoom,
    });
  } catch(error){
    return reply.code(400).send({
      hata:'oda oluşturulamadı.Lütfen bilgilerinizi kontrol ediniz',
    });
  }
  });

  // Açık route: Tüm odaları listele (token gerekmez) herkese açık
  fastify.get('/rooms', async (request, reply) => {
    
    const rooms = await prisma.room.findMany();
    return rooms;
  });
  //Belirli bir odayı getirme (JWT Korumalı)
  fastify.get('/rooms/:id',{preHandler:verifyToken},async(request,reply)=>{
    try{
      const id = parseInt(request.params.id);
      const room = await prisma.room.findUnique({where: {id}});

      if(!room){
       return reply.code(404).send({hata: 'oda bulunamadı'}); 
    }
 
    return room;
  }catch(error){
    return reply.code(500).send({hata:'Oda getirilirken bir hata oluştu.'});
  }
});  

  //Oda bilgilerini güncelle(JWT Korumalı)
  fastify.put('/rooms/:id',{preHandler:verifyToken},async(request,reply)=>{
    const id = parseInt(request.params.id);
    const {name,capacity,location} = request.body;
    
    try{
      const updatedRoom = await prisma.room.update({
        where:{id},
        data:{name, capacity,location},
      });
      return reply.send({
       mesaj:'oda güncellendi',
       oda:updatedRoom,
      });
    } catch(error) {
      return reply.code(400).send({hata:'Güncelleme işlemi başarısız',detay:error.mesaj});
    }
  });
  // Odayı sil
  fastify.delete('/rooms/:id',{preHandler:verifyToken},async(request,reply)=>{
    const id = parseInt(request.params.id);
  try{
      await prisma.room.delete({where:{id} });
      return reply.send({mesaj:'Oda silindi.'});
    } catch ( error){
      return reply.code(400).send({hata:'Silme işlemi başarısız.',detay:error.mesaj});
    }

  });
    
  }

module.exports = roomRoutes;
