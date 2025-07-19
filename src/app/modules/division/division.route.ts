import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createDivisionZodSchema,
  updateDivisionZodSchema,
} from "./division.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { DivisionController } from "./division.controller";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createDivisionZodSchema),
  DivisionController.createDivision
);
router.get("/", DivisionController.getAllDivision);
router.get("/:slug", DivisionController.getSingleDivision);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateDivisionZodSchema), DivisionController.updateDivision
);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), DivisionController.deleteDivision);

export const DivisionRoutes = router;
