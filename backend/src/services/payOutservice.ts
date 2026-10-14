
import { IMilestone } from "../models/campaign";

export const calculatePayout = (
  views: number,
  milestones: IMilestone[]
): number => {
  const eligibleMilestones = milestones.filter(
    (milestone) => views >= milestone.views
  );

  if (eligibleMilestones.length === 0) {
    return 0;
  }

  return Math.max(
    ...eligibleMilestones.map((milestone) => milestone.payout)
  );
};
