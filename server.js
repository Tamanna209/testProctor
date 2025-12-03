import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import dbConfig from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import proctorRoutes from "./routes/proctor.routes.js";
import questionRoutes from "./routes/question.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import devRoutes from "./routes/dev.routes.js";
console.log(process.env.MONGODB_URL);
const rawFrontend = process.env.FRONTEND_URL || "";
const FRONTEND_URL = rawFrontend.replace(/\/+$/, "");
console.log("Configured FRONTEND_URL:", FRONTEND_URL);
const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);
console.log("Allowed CORS origins:", allowedOrigins);

const app = express();
app.use(
  cors({
    origin: function (origin, callback) {
      // allow non-browser (curl, server-to-server) requests with no origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy: origin not allowed"));
    },
    credentials: true,
  })
);
// Also ensure preflight requests are handled (use regex to avoid path-to-regexp '*' parsing issues)
app.options(/.*/, cors());
app.use(express.json());

// app.use(cors(corsOptions));
app.use("/api/auth", authRoutes);
// app.options("*", cors(corsOptions));
app.use("/api/test", testRoutes);
app.use("/api/proctor", proctorRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/admin", adminRoutes); // Admin endpoints
app.use("/api/_dev", devRoutes); // Dev-only endpoints for testing

app.get("/", (req, res) => {
  res.send("Server Running...");
});

const port = process.env.PORT || 8080;

app.listen(port, async () => {
  await dbConfig();
  console.log(
    `Server started at http://localhost:${port} and https://testproctor.onrender.com`
  );
});
