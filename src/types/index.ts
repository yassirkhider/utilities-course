// Core domain types for the Process Utilities & Auxiliary Support Systems Operation course site

export type ResourceType =
  | 'handout'
  | 'pid'
  | 'activity'
  | 'presentation'
  | 'schedule'
  | 'video'
  | 'document'
  | 'worksheet'
  | 'quiz-support';

export interface Resource {
  id: string;
  title: string;
  description: string;
  fileName: string;
  blobKey: string | null; // null when it's an external URL resource
  externalUrl?: string | null;
  mimeType: string;
  size: number; // bytes
  resourceType: ResourceType;
  topicId: string | null;
  dayId: string | null;
  thumbnail: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleRow {
  id: string;
  order: number;
  startTime: string; // "08:00"
  endTime: string; // "08:30"
  title: string;
  type: 'session' | 'break' | 'lunch' | 'activity' | 'assessment';
}

export type ActivityType =
  | 'P&ID Tracing'
  | 'Process Flow Challenge'
  | 'Troubleshooting Scenario'
  | 'Group Discussion'
  | 'Equipment Identification'
  | 'Hazard Identification'
  | 'Startup Sequencing'
  | 'Shutdown Sequencing'
  | 'Fault Finding'
  | 'Quick Quiz';

export interface Activity {
  id: string;
  title: string;
  objective: string;
  activityType: ActivityType;
  dayId: string | null;
  topicId: string | null;
  duration: number; // minutes
  groupSize: string;
  instructions: string; // rich text (sanitized HTML)
  instructorNotes: string;
  requiredResources: string;
  expectedAnswer: string;
  order: number;
  slot?: 'knowledge-check' | 'pid-process' | 'troubleshooting' | null;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export type QuizKind = 'initial-assessment' | 'daily-review' | 'final-assessment';

export interface Quiz {
  id: string;
  title: string;
  kind: QuizKind;
  dayId: string | null;
  topicId: string | null;
  questions: QuizQuestion[];
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  dayId: string | null;
  order: number;
  learningObjectives: string;
  systemPurpose: string;
  processOverview: string;
  mainEquipment: string;
  operatingParameters: string;
  processFlow: string;
  instrumentationControls: string;
  startupConsiderations: string;
  normalOperation: string;
  shutdownConsiderations: string;
  commonProblems: string;
  troubleshooting: string;
  safetyConsiderations: string;
  safetyTags: SafetyTag[];
  /** Full authentic narrative reference content extracted from the official course
   * materials (may include headings, tables and flow-diagram blockquotes). Rendered
   * as an additional "Full Technical Reference" section on the topic page. Optional
   * so hand-added topics without this level of detail remain valid. */
  extendedContentHtml?: string;
}

export type SafetyTag =
  | 'h2s'
  | 'high-pressure-steam'
  | 'hot-surfaces'
  | 'rotating-equipment'
  | 'chemical-exposure'
  | 'pressure-systems'
  | 'confined-spaces'
  | 'electrical-equipment'
  | 'hydrocarbon-release';

export interface DayPlan {
  id: string; // "day-1"
  dayNumber: number;
  title: string;
  focus: string; // short subtitle e.g. "Fundamentals & Utility Water / Air Systems"
  description: string;
  objectives: string;
  topicIds: string[];
  schedule: ScheduleRow[];
}

export interface CourseMeta {
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  objectives: string;
  audience: string;
  courseImage: string | null;
  instructorName: string;
  instructorTitle: string;
  instructorBio: string;
  footerText: string;
  location: string;
  dates: string;
}

export interface CourseData {
  course: CourseMeta;
  days: DayPlan[];
  topics: Topic[];
  activities: Activity[];
  quizzes: Quiz[];
  resources: Resource[];
  updatedAt: string;
}

export interface QuizAttemptResult {
  quizId: string;
  score: number;
  total: number;
  percentage: number;
  answers: number[];
  completedAt: string;
}
