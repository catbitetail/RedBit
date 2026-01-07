
export interface InsightPoint {
  point: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  count: number;
  quote: string;
}

export interface Emotion {
  label: string;
  score: number; // 0-100
  type: 'Anxiety' | 'Healing' | 'Desire' | 'Disappointment' | 'Humblebrag' | 'Resonance' | 'Other';
}

export interface AudienceProfile {
  description: string;
  tags: string[];
}

export interface ClassRep {
  controversies: string[];
  info_gains: string[];
  god_replies: string[];
}

export interface ViewpointItem {
  content: string;
  value_score: number; // 1-10, how valuable/insightful this point is
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface ViewpointCategory {
  category_name: string;
  viewpoints: ViewpointItem[];
}

export interface AnalysisResult {
  short_title?: string; // New: AI generated concise title
  summary: string;
  sentiment_score: number; // 0 to 1, where 1 is very positive
  emotions: Emotion[];
  key_insights: InsightPoint[];
  class_rep: ClassRep;
  audience_profile: AudienceProfile;
  comprehensive_viewpoints: ViewpointCategory[]; // New Field
  next_topics: string[];
  questions_asked: string[];
  meme_alert: string[];
  competitor_weaknesses?: string[];
  raw_content?: string; // Stores the original comment text for Q&A context
  initial_chat_response?: string; // Stores the generated expert report to prevent regeneration
}

export interface ReplySuggestion {
  tone: string;
  reply: string;
}

export interface TopicDraft {
  title: string;
  content: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  images?: string[]; // Array of base64 strings (pure base64, no data URI prefix)
}

export interface SavedReport {
  id: string;
  timestamp: number;
  title: string; // Usually the first few words of the summary
  data: AnalysisResult;
  notes: string;
}