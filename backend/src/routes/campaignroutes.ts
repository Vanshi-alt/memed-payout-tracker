
import { Router } from "express";
import {
  createCampaign,
  getLiveCampaigns,
  getMyCampaigns,
} from "../controllers/campaignController";
import {
  authenticate,
  authorizeRoles,
} from "../middeware/authMiddleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("brand"),
  createCampaign
);

router.get(
  "/live",
  authenticate,
  authorizeRoles("creator"),
  getLiveCampaigns
);

router.get(
  "/mine",
  authenticate,
  authorizeRoles("brand"),
  getMyCampaigns
);

export default router;
