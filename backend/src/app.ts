import express from "express";
import cors from "cors";
import authRoutes from "./routes/authroutes";
import campaignRoutes from "./routes/campaignroutes";
import submissionRoutes from "./routes/submissionroutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Meme'd Payout Tracker API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/submissions", submissionRoutes);

export default app;
