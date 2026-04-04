export interface ProfileData {
  id: number;
  name: string;
  handle: string;
  photo_url: string | null;
  bio: string | null;
  subscriberCount: string | null;
  subscriberCountNumber: number | null;
  followerCount: number;
  hasPaidTier: boolean;
}

export interface PostData {
  title: string;
  subtitle: string | null;
  canonical_url: string;
  heartCount: number;
  restacks: number;
  audience: string;
  post_date: string;
}

export interface NoteData {
  id: number;
  body: string;
  date: string;
  heartCount: number;
  restacks: number;
  replyCount: number;
}

export interface ProfileResponse {
  profile: ProfileData;
  topPosts: PostData[];
  topNotes: NoteData[];
}

export interface ApiError {
  error: string;
}
