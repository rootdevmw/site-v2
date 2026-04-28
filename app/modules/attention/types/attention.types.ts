export type PrayerStatus = "PENDING" | "REVIEWED" | "PRAYED_FOR";
export type VisitorStatus = "PENDING" | "CONFIRMED" | "COMPLETED";

export type Prayer = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  prayerFor: string;
  request: string;
  status: PrayerStatus;
  createdAt: string;
};

export type Visitor = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  visitDate: string;
  groupSize: string;
  isChurchOfChrist?: string;
  language?: string;
  hasSpecialNeeds: boolean;
  specialNeedsDetails?: string;
  message?: string;
  status: VisitorStatus;
  createdAt: string;
};

export type AttentionOverviewResponse = {
  prayers: Prayer[];
  visitors: Visitor[];
};

export type AttentionItem =
  | (Prayer & { type: "prayer" })
  | (Visitor & { type: "visitor" });
