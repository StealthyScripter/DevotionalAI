
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
  Love = 'Love'
}

export enum Format {
  SMS = 'SMS Message',
  Email = 'Email Newsletter',
  SocialPost = 'Social Media Post',
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

export interface ContentTemplate {
  format: Format;
  systemInstruction: string;
  tone: string;
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
  content: GeneratedContent;
  status: PipelineStatus;
  postedAt?: number;
  platforms?: string[];
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
  Short = 'Short (100 words)',
  Medium = 'Medium (300 words)',
  Long = 'Long (500+ words)'
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  isVerified: boolean;
  is2FAEnabled: boolean;
  createdAt: number;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

export interface VideoScript {
  hook: string;
  body: string;
  cta: string;
  visuals: string;
  audio: string;
}

export interface GeneratedContent {
  title: string;
  bibleVerse: string;
  devotionalMessage: string;
  practicalApplication: string;
  callToAction: string;
  hashtags?: string[];
  videoScript?: VideoScript;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
