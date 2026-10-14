
import { Request, Response } from "express";
import mongoose from "mongoose";
import Campaign, {
  CampaignPlatform,
  IMilestone,
} from "../models/campaign";
import { AuthenticatedRequest } from "../middeware/authMiddleware";

export const createCampaign = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { name, platform, budget, milestones } = req.body;

    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message: "Please log in first",
      });
      return;
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      !["Instagram", "YouTube"].includes(platform) ||
      typeof budget !== "number" ||
      !Number.isFinite(budget) ||
      budget <= 0 ||
      !Array.isArray(milestones) ||
      milestones.length === 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "Provide a name, valid platform, positive budget and milestones",
      });
      return;
    }

    const validMilestones = milestones.every(
      (item: IMilestone) =>
        Number.isSafeInteger(item.views) &&
        item.views > 0 &&
        typeof item.payout === "number" &&
        Number.isFinite(item.payout) &&
        item.payout >= 0
    );

    if (!validMilestones) {
      res.status(400).json({
        success: false,
        message: "Milestone views and payouts must be valid numbers",
      });
      return;
    }

    const sortedMilestones = [...milestones].sort(
      (a: IMilestone, b: IMilestone) => a.views - b.views
    );

    for (let i = 1; i < sortedMilestones.length; i++) {
      if (
        sortedMilestones[i].views <= sortedMilestones[i - 1].views ||
        sortedMilestones[i].payout < sortedMilestones[i - 1].payout
      ) {
        res.status(400).json({
          success: false,
          message:
            "Milestone views must increase, and payouts cannot decrease",
        });
        return;
      }
    }

    const campaign = await Campaign.create({
      brandId: new mongoose.Types.ObjectId(authReq.user.userId),
      name: name.trim(),
      platform: platform as CampaignPlatform,
      budget,
      milestones: sortedMilestones,
    });

    res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      campaign: {
        id: campaign._id,
        name: campaign.name,
        platform: campaign.platform,
        budget: campaign.budget,
        spent: campaign.spent,
        remaining: campaign.budget - campaign.spent,
        milestones: campaign.milestones,
        isLive: campaign.isLive,
      },
    });
  } catch (error) {
    console.error("Create campaign error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create campaign",
    });
  }
};

export const getLiveCampaigns = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const campaigns = await Campaign.find({
      isLive: true,
      $expr: { $gt: ["$budget", "$spent"] },
    })
      .select("name platform budget spent milestones createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns: campaigns.map((campaign) => ({
        ...campaign,
        remaining: campaign.budget - campaign.spent,
      })),
    });
  } catch (error) {
    console.error("Get live campaigns error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch live campaigns",
    });
  }
};

export const getMyCampaigns = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message: "Please log in first",
      });
      return;
    }

    const campaigns = await Campaign.find({
      brandId: authReq.user.userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns: campaigns.map((campaign) => ({
        ...campaign,
        remaining: campaign.budget - campaign.spent,
      })),
    });
  } catch (error) {
    console.error("Get brand campaigns error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch your campaigns",
    });
  }
};
