
import mongoose, { Document, Schema } from "mongoose";

export interface ISubmission extends Document {
  creatorId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  postUrl: string;
  views: number;
  payoutEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    postUrl: {
      type: String,
      required: true,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    payoutEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);
submissionSchema.index(
  { creatorId: 1, campaignId: 1 },
  { unique: true }
);

const Submission = mongoose.model<ISubmission>(
  "Submission",
  submissionSchema
);

export default Submission;
