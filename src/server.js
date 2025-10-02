const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

// Örnek route (senin mevcut route'ların burada olacak)
app.get("/", (req, res) => {
  res.send("KampusAI API Çalışıyor 🚀");
});

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/kampusai", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB bağlantısı başarılı"))
  .catch((err) => console.error("❌ MongoDB bağlantı hatası:", err));

const PORT = process.env.PORT || 3000;
const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${3000} adresinde çalışıyor`);
});

// Testlerde kapatma için export
module.exports = { httpServer, mongoose };
