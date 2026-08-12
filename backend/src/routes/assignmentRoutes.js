import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/rbac.js";
import {
  listAssignments,
  createAssignment,
  createExpenditure
} from "../controllers/assignmentController.js";

const router = Router();

router.use(authenticateToken);

router.get(
  "/",
  authorizeRoles("ADMIN", "BASE_COMMANDER"),
  listAssignments
);

router.post(
  "/",
  authorizeRoles("ADMIN", "BASE_COMMANDER"),
  createAssignment
);

router.post(
  "/expenditure",
  authorizeRoles("ADMIN", "BASE_COMMANDER"),
  createExpenditure
);

export default router;
