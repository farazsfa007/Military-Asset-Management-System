import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/rbac.js";
import { listTransfers, createTransfer } from "../controllers/transferController.js";

const router = Router();

router.use(authenticateToken);

router.get("/", listTransfers);

router.post(
  "/",
  authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  createTransfer
);

export default router;
