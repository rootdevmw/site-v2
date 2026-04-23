type AttentionItem =
  | {
      id: string;
      type: "prayer";
      name?: string;
      phone?: string;
      email?: string;
      prayerFor: string;
      request: string;
      status: string;
      createdAt: string;
    }
  | {
      id: string;
      type: "visitor";
      name: string;
      phone?: string;
      email?: string;
      visitDate: string;
      groupSize: string;
      status: string;
      message?: string;
      createdAt: string;
    };

export type Prayer = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  prayerFor: string;
  request: string;
  status: string;
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
  status: string;
  createdAt: string;
};
