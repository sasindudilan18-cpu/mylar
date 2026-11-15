export type DesignCategory =
  | '3.5g Stand-Up'
  | 'Die-Cut Shape'
  | 'Holographic Foil'
  | 'Matte & Spot UV';

export interface MylarDesign {
  id: string;
  title: string;
  category: DesignCategory;
  finish: string;
  dimensions: string;
  description: string;
  imageUrl: string;
  fiverrUrl: string;
  createdAt: string;
  isPreset?: boolean;
}

export interface UserSession {
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  savedDesignIds?: string[];
}
