import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import os from "os";

dotenv.config();

import users from "./routes/users.js";
import auth from "./routes/auth.js";
import groups from "./routes/groups.js";
import ai from "./routes/ai.js";
import morgan from "morgan";


import cors from "cors";

const app = express();

// Load cấu hình từ .env
const port = process.env.PORT || 8000;
const api_url = process.env.API_URL || "/api";
const mongodb_url = process.env.MONGODB_URL;

// Middleware
app.use(cors({ origin: '*' })); // hoặc giới hạn origin cho an toàn
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan(":method :url :status :response-time ms - :res[content-length]"));

// 👉 Log body request (debug thêm)
// app.use((req, res, next) => {
//   if (req.body && Object.keys(req.body).length > 0) {
//     console.log("📩 Request Body:", req.body);
//   }
//   next();
// });

// Kết nối MongoDB
mongoose.set("strictQuery", true);
mongoose.connect(mongodb_url)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Failed to connect MongoDB:", err));

// Route mặc định (check server hoạt động)
app.get("/", (req, res) => {
  res.send("Hello from Express server");
});

// Các route API chính
app.use(`${api_url}/users`, users);
app.use(`${api_url}/auth`, auth);
app.use(`${api_url}/groups`, groups);
app.use(`${api_url}/ai`, ai);

// 👉 Middleware bắt lỗi (nên đặt cuối cùng)
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack || err.message);
  res.status(500).json({ error: "Internal Server Error" });
});


// Lắng nghe server (không truyền HOST → phù hợp cloud)
app.listen(port, () => {
  const networkInterfaces = os.networkInterfaces();
  let localIp = "127.0.0.1";

  for (const iface of Object.values(networkInterfaces)) {
    for (const net of iface) {
      if (net.family === "IPv4" && !net.internal) {
        localIp = net.address;
        break;
      }
    }
  }

  console.log(`🚀 Server is running:`);
  console.log(`   Local:   http://localhost:${port}${api_url}`);
  console.log(`   Network: http://${localIp}:${port}${api_url}`);
});

