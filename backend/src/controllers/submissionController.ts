import { Request, Response } from "express";
import mongoose from "mongoose";
import Campaign from "../models/campaign";
import Submission from "../models/submission";
import { AuthenticatedRequest } from "../middeware/authMiddleware";
import { calculatePayout } from "../services/payOutservice";


export const createSubmission = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { campaignId, postUrl } = req.body;

    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message: "Please log in first",
      });
      return;
    }

    if (
      typeof campaignId !== "string" ||
      !mongoose.isValidObjectId(campaignId) ||
      typeof postUrl !== "string" ||
      !postUrl.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "A valid campaignId and postUrl are required",
      });
      return;
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(postUrl.trim());
    } catch {
      res.status(400).json({
        success: false,
        message: "Please provide a valid post URL",
      });
      return;
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    const isInstagram =
      hostname === "instagram.com" ||
      hostname.endsWith(".instagram.com");

    const isYouTube =
      hostname === "youtube.com" ||
      hostname.endsWith(".youtube.com") ||
      hostname === "youtu.be";

    if (
      parsedUrl.protocol !== "https:" ||
      (!isInstagram && !isYouTube)
    ) {
      res.status(400).json({
        success: false,
        message: "Use a valid HTTPS Instagram or YouTube URL",
      });
      return;
    }

    const campaign = await Campaign.findOne({
      _id: campaignId,
      isLive: true,
      $expr: { $gt: ["$budget", "$spent"] },
    });

    if (!campaign) {
      res.status(404).json({
        success: false,
        message: "Live campaign not found or its budget is exhausted",
      });
      return;
    }

    if (
      (campaign.platform === "Instagram" && !isInstagram) ||
      (campaign.platform === "YouTube" && !isYouTube)
    ) {
      res.status(400).json({
        success: false,
        message: "The post URL must match the campaign platform",
      });
      return;
    }

    const existingSubmission = await Submission.findOne({
      creatorId: authReq.user.userId,
      campaignId: campaign._id,
    });

    if (existingSubmission) {
      res.status(409).json({
        success: false,
        message: "You have already submitted a post for this campaign",
      });
      return;
    }

    const submission = await Submission.create({
      creatorId: authReq.user.userId,
      campaignId: campaign._id,
      postUrl: parsedUrl.toString(),
      views: 0,
      payoutEarned: 0,
    });

    res.status(201).json({
      success: true,
      message: "Post submitted successfully",
      submission,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "You have already submitted a post for this campaign",
      });
      return;
    }

    console.error("Create submission error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to submit post",
    });
  }
};


export const updateSubmissionViews = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { views } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid submission ID",
    });
    return;
  }

  if (
    !Number.isSafeInteger(views) ||
    views < 0
  ) {
    res.status(400).json({
      success: false,
      message: "Views must be a non-negative integer",
    });
    return;
  }

  const session = await mongoose.startSession();

  try {
    let result:
      | {
          submissionId: string;
          views: number;
          targetPayout: number;
          payoutThisUpdate: number;
          totalPayout: number;
          campaignRemaining: number;
        }
      | undefined;

    await session.withTransaction(async () => {
      const submission = await Submission.findById(id).session(session);

      if (!submission) {
        throw new Error("SUBMISSION_NOT_FOUND");
      }

      const campaign = await Campaign.findById(
        submission.campaignId
      ).session(session);

      if (!campaign) {
        throw new Error("CAMPAIGN_NOT_FOUND");
      }

      const targetPayout = calculatePayout(
        views,
        campaign.milestones
      );

      const unpaidAmount = Math.max(
        0,
        targetPayout - submission.payoutEarned
      );

      const remaining = Math.max(
        0,
        campaign.budget - campaign.spent
      );

      const payoutThisUpdate = Math.min(
        unpaidAmount,
        remaining
      );

      if (payoutThisUpdate > 0) {
        const updatedCampaign = await Campaign.findOneAndUpdate(
          {
            _id: campaign._id,
            $expr: {
              $lte: [
                { $add: ["$spent", payoutThisUpdate] },
                "$budget",
              ],
            },
          },
          {
            $inc: { spent: payoutThisUpdate },
          },
          {
            new: true,
            session,
          }
        );

        if (!updatedCampaign) {
          throw new Error("BUDGET_UPDATE_CONFLICT");
        }
      }

      submission.views = views;
      submission.payoutEarned += payoutThisUpdate;

      await submission.save({ session });

      result = {
        submissionId: submission._id.toString(),
        views,
        targetPayout,
        payoutThisUpdate,
        totalPayout: submission.payoutEarned,
        campaignRemaining:
          campaign.budget -
          campaign.spent -
          payoutThisUpdate,
      };
    });

    res.status(200).json({
      success: true,
      message: "Views updated successfully",
      ...result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SUBMISSION_NOT_FOUND") {
        res.status(404).json({
          success: false,
          message: "Submission not found",
        });
        return;
      }

      if (error.message === "CAMPAIGN_NOT_FOUND") {
        res.status(404).json({
          success: false,
          message: "Campaign not found",
        });
        return;
      }
    }

    console.error("Update views error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update views and payout",
    });
  } finally {
    await session.endSession();
  }
};


export const getMySubmissions = async (
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

    const submissions = await Submission.find({
      creatorId: authReq.user.userId,
    })
      .populate("campaignId", "name platform milestones")
      .sort({ createdAt: -1 })
      .lean();

    const totalEarnings = submissions.reduce(
      (total, submission) => total + submission.payoutEarned,
      0
    );

    res.status(200).json({
      success: true,
      totalEarnings,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Get creator submissions error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch your earnings",
    });
  }
};

