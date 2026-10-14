
import { Router } from "express";
import { createSubmission, updateSubmissionViews,  getMySubmissions, } from "../controllers/submissionController";
import {
  authenticate,
  authorizeRoles,
} from "../middeware/authMiddleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("creator"),
  createSubmission
);

router.patch("/:id/views", updateSubmissionViews);

router.get(
  "/mine",
  authenticate,
  authorizeRoles("creator"),
  getMySubmissions
);

export default router;
