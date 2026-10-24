export type PrayerStatus = "PENDING" | "REVIEWED" | "PRAYED_FOR";
export type VisitorStatus = "PENDING" | "CONFIRMED" | "COMPLETED";

export type Prayer = {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  requestType?: string | null;
  isUrgent: boolean;
  shareWithElders: boolean;
  prayerFor: string;
  request: string;
  status: PrayerStatus;
  createdAt: string;
  updatedAt?: string;
};

export type Visitor = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  visitDate: string;
  groupSize: string;
  isChurchOfChrist?: string | null;
  language?: string | null;
  hasSpecialNeeds: boolean;
  specialNeedsDetails?: string | null;
  message?: string | null;
  status: VisitorStatus;
  createdAt: string;
  updatedAt?: string;
};

export type AttentionOverviewResponse = {
  prayers: Prayer[];
  visitors: Visitor[];
};

export type AttentionItem =
  | (Prayer & { type: "prayer" })
  | (Visitor & { type: "visitor" });
