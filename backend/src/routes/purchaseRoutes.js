import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/rbac.js";
import { listPurchases, createPurchase } from "../controllers/purchaseController.js";

const router = Router();

router.use(authenticateToken);

router.get("/", listPurchases);

router.post(
  "/",
  authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  createPurchase
);

export default router;
