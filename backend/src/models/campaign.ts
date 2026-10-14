import mongoose, { Document, Schema } from "mongoose";

export type CampaignPlatform = "Instagram" | "YouTube";

export interface IMilestone {
  views: number;
  payout: number;
}

export interface ICampaign extends Document {
  brandId: mongoose.Types.ObjectId;
  name: string;
  platform: CampaignPlatform;
  budget: number;
  spent: number;
  milestones: IMilestone[];
  isLive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    views: {
      type: Number,
      required: true,
      min: 1,
    },
    payout: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const campaignSchema = new Schema<ICampaign>(
  {
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ["Instagram", "YouTube"],
      required: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 1,
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
    milestones: {
      type: [milestoneSchema],
      required: true,
      validate: {
        validator: (items: IMilestone[]) => items.length > 0,
        message: "At least one milestone is required",
      },
    },
    isLive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Campaign = mongoose.model<ICampaign>(
  "Campaign",
  campaignSchema
);

export default Campaign;
