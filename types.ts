
export enum Role {
  User = 'user',
  Admin = 'admin'
}

export enum Theme {
  Hope = 'Hope',
  Anxiety = 'Anxiety',
  Courage = 'Courage',
  Faith = 'Faith',
  Healing = 'Healing',
  Wisdom = 'Wisdom',
  Strength = 'Strength',
  Love = 'Love',
  BibleStories = 'Bible Stories',
  Teaching = 'Teaching',
  Family = 'Family',
  Tribulation = 'Tribulation'
}

export enum Format {
  SMS = 'SMS Message',
  Email = 'Email Newsletter',
  SocialPost = 'Social Media Post',
  SermonMini = 'Mini-Sermon',
  SermonLong = 'Full-Length Sermon',
  SermonNotes = 'Sermon Notes',
  VideoScript = 'Video Script',
  ImagePrompt = 'Image Concept'
}

export enum PipelineStatus {
  Scheduled = 'Scheduled',
  Generating = 'Generating',
  Ready = 'Ready',
  Approved = 'Approved',
  Posted = 'Posted',
  Failed = 'Failed'
}

export interface CalendarEntry {
  id: string;
  date: string;
  verse: string;
  theme: Theme;
  requestedFormats: Format[];
}

export interface PipelineItem {
  id: string;
  calendarId: string;
  format: Format;
  theme?: Theme;
  content: GeneratedContent;
  status: PipelineStatus;
  postedAt?: number;
}

export enum Audience {
  Children = 'Children',
  Teens = 'Teens',
  Adults = 'Adults',
  Seniors = 'Seniors'
}

export enum Style {
  Inspirational = 'Inspirational',
  Storytelling = 'Storytelling',
  Teaching = 'Teaching',
  Liturgical = 'Liturgical'
}

export enum Length {
  Short = 'Short',
  Medium = 'Medium',
  Long = 'Long'
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  isVerified: boolean;
  is2FAEnabled: boolean;
  isBlacklisted?: boolean;
  acceptedTermsAt: number;
  createdAt: number;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

export interface GeneratedContent {
  title: string;
  bibleVerse: string;
  devotionalMessage: string;
  practicalApplication: string;
  callToAction: string;
  hashtags?: string[];
  imageUrl?: string;
  videoUrl?: string;
  videoScript?: string;
  format?: Format;
}

export interface PublishedContent extends GeneratedContent {
  id: string;
  publishedAt: number;
  source?: 'pipeline' | 'ai_center' | 'media_lab' | 'manual';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AuditLogEntry {
  id: string;
  at: number;
  actorId: string;
  actorEmail: string;
  action: 'role_changed' | 'blacklist_added' | 'blacklist_removed' | 'published_created' | 'published_deleted' | string;
  entityType?: string;
  entityId?: string;
  target?: string;
  source?: string;
  previousRole?: string;
  newRole?: string;
}
