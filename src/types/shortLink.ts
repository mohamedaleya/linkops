export interface ShortLink {
  id: string;
  originalUrl: string;
  shortened_id: string;
  visits: number;
  createdAt: string;
  isVerified?: boolean;
  securityStatus?: string;
}
