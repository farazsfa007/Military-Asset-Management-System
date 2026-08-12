import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { getDashboard } from "../controllers/dashboardController.js";

const router = Router();

router.get("/", authenticateToken, getDashboard);

export default router;
