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

export interface Stats {
  notesLast6Months: number;
  postsLast3Months: number;
  avgDailyNotes: number;    // over 6-month window
  avgWeeklyPosts: number;   // over 3-month window
}

export interface ProfileResponse {
  profile: ProfileData;
  topPosts: PostData[];
  topNotes: NoteData[];
  stats: Stats;
}

export interface ProfileChunk {
  type: "profile";
  profile: ProfileData;
  topPosts: PostData[];
}

export interface ProgressChunk {
  type: "progress";
  pagesScanned: number;
  notesFound: number;
}

export interface CompleteChunk {
  type: "complete";
  topNotes: NoteData[];
  stats: Stats;
}

export type StreamChunk = ProfileChunk | ProgressChunk | CompleteChunk;

export interface ApiError {
  error: string;
}
