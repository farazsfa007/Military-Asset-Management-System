import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { getBases, getEquipmentTypes } from "../controllers/masterController.js";

const router = Router();

router.use(authenticateToken);
router.get("/bases", getBases);
router.get("/equipment-types", getEquipmentTypes);

export default router;
