import { useState, useCallback, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type KaiMessageRole = 'user' | 'kai';
export type KaiOrbState = 'idle' | 'listening' | 'processing' | 'thinking' | 'speaking';
export type ConversationPhase = 'idle' | 'followup' | 'confirming' | 'executing' | 'done';

export type KaiCardType =
  | 'task-created'
  | 'calendar-event'
  | 'rescue-plan'
  | 'study-plan'
  | 'analytics'
  | 'followup'
  | 'confirmation';

export interface KaiSmartCard {
  type: KaiCardType;
  data: Record<string, any>;
}

export interface KaiMessage {
  id: string;
  role: KaiMessageRole;
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
  card?: KaiSmartCard;
}

export type IntentType =
  | 'schedule-task'
  | 'rescue-plan'
  | 'plan-week'
  | 'placement-roadmap'
  | 'optimize-calendar'
  | 'general';

export interface FollowUpQuestion {
  id: string;
  question: string;
  placeholder: string;
  type: 'text' | 'select' | 'chips';
  options?: string[];
  paramKey: string;
  required: boolean;
}

interface CollectedParams {
  [key: string]: string;
}

// ─── Subject & Title Extraction ───────────────────────────────────────────────

// Map of keywords → canonical subject name
const SUBJECT_MAP: Record<string, string> = {
  'sql': 'SQL',
  'mysql': 'SQL',
  'postgresql': 'SQL',
  'queries': 'SQL',
  'joins': 'SQL',
  'dsa': 'DSA',
  'data structures': 'DSA',
  'data structure': 'DSA',
  'leetcode': 'DSA',
  'codechef': 'DSA',
  'codeforces': 'DSA',
  'arrays': 'Arrays',
  'array': 'Arrays',
  'graphs': 'Graph Algorithms',
  'graph': 'Graph Algorithms',
  'trees': 'Trees & BST',
  'tree': 'Trees & BST',
  'dynamic programming': 'Dynamic Programming',
  'dp': 'Dynamic Programming',
  'greedy': 'Greedy Algorithms',
  'backtracking': 'Backtracking',
  'sorting': 'Sorting Algorithms',
  'searching': 'Searching Algorithms',
  'daa': 'DAA',
  'design and analysis': 'DAA',
  'algorithms': 'Algorithms',
  'react': 'React',
  'reactjs': 'React',
  'hooks': 'React Hooks',
  'redux': 'Redux',
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'js': 'JavaScript',
  'ts': 'TypeScript',
  'python': 'Python',
  'java': 'Java',
  'c++': 'C++',
  'golang': 'Go',
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'express': 'Express.js',
  'mongodb': 'MongoDB',
  'redis': 'Redis',
  'system design': 'System Design',
  'os': 'Operating Systems',
  'operating system': 'Operating Systems',
  'dbms': 'DBMS',
  'database': 'Database',
  'networking': 'Computer Networks',
  'networks': 'Computer Networks',
  'machine learning': 'Machine Learning',
  'ml': 'Machine Learning',
  'deep learning': 'Deep Learning',
  'web dev': 'Web Development',
  'web development': 'Web Development',
  'backend': 'Backend Development',
  'frontend': 'Frontend Development',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'devops': 'DevOps',
  'aptitude': 'Aptitude',
  'placement': 'Placement Prep',
  'interview': 'Interview Prep',
};

// Detect subject from text, return canonical name or null
function detectSubject(text: string): string | null {
  const lower = text.toLowerCase();
  // Sort by length descending so 'system design' matches before 'design'
  const keys = Object.keys(SUBJECT_MAP).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    // Match whole word or phrase
    const regex = new RegExp(`(?<![a-z])${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z])`, 'i');
    if (regex.test(lower)) {
      return SUBJECT_MAP[key];
    }
  }
  return null;
}

// Detect action type from text
function detectActionType(text: string): string {
  const lower = text.toLowerCase();
  if (/exam|midterm|final|test|quiz|viva/.test(lower)) return 'Exam Preparation';
  if (/revis|review/.test(lower)) return 'Revision';
  if (/practice|solve|coding/.test(lower)) return 'Practice';
  if (/project|build|create|develop|implement/.test(lower)) return 'Project';
  if (/assignment|homework|submission/.test(lower)) return 'Assignment';
  if (/interview|prep|mock/.test(lower)) return 'Interview Prep';
  if (/plan|schedule|organize/.test(lower)) return 'Study Session';
  if (/learn|understand|study/.test(lower)) return 'Study Session';
  return 'Study Session';
}

// Extract a meaningful task title from user input
function extractTaskTitle(text: string, intent: IntentType): string {
  const subject = detectSubject(text);
  const action = detectActionType(text);

  if (subject && action !== 'Study Session') {
    return `${subject} ${action}`;
  }
  if (subject) {
    switch (intent) {
      case 'rescue-plan': return `${subject} Emergency Prep`;
      case 'plan-week':   return `${subject} Weekly Plan`;
      default:            return `${subject} Study Session`;
    }
  }

  // Fallback: extract meaningful words from user input
  const skipWords = new Set([
    'schedule', 'create', 'add', 'set', 'plan', 'my', 'a', 'an', 'the', 'for',
    'to', 'i', 'want', 'need', 'please', 'can', 'you', 'help', 'me', 'tomorrow',
    'today', 'this', 'week', 'next', 'and', 'or', 'in', 'at', 'on', 'it', 'is',
    'am', 'are', 'was', 'were', 'will', 'be', 'do', 'does', 'did', 'how', 'what',
    'when', 'where', 'why', 'which', 'some', 'have', 'has', 'had'
  ]);
  const words = text.replace(/[.,!?]/g, '').split(/\s+/);
  const meaningful = words.filter(w => w.length > 2 && !skipWords.has(w.toLowerCase()));

  if (meaningful.length > 0) {
    return meaningful
      .slice(0, 3)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  return 'Study Session';
}

// Extract pre-filled params from initial user text (so we skip those follow-ups)
function extractInitialParams(text: string): CollectedParams {
  const lower = text.toLowerCase();
  const params: CollectedParams = {};

  // Duration
  const durMatch = text.match(/(\d+(?:\.\d+)?)\s*(hour|hr|hrs|minute|min|mins)/i);
  if (durMatch) {
    const num = parseFloat(durMatch[1]);
    const unit = durMatch[2].toLowerCase();
    params.duration = unit.startsWith('h')
      ? `${num} hour${num !== 1 ? 's' : ''}`
      : `${Math.round(num)} minutes`;
  }

  // Time of day
  if (/morning/.test(lower))          params.preferredTime = 'Morning (8–11 AM)';
  else if (/afternoon/.test(lower))   params.preferredTime = 'Afternoon (12–3 PM)';
  else if (/evening/.test(lower))     params.preferredTime = 'Evening (6–9 PM)';
  else if (/night|midnight/.test(lower)) params.preferredTime = 'Late Night';
  else if (/(\d{1,2})\s*(am|pm)/i.test(text)) {
    const hrMatch = text.match(/(\d{1,2})\s*(am|pm)/i);
    if (hrMatch) {
      const hr = parseInt(hrMatch[1]);
      const period = hrMatch[2].toLowerCase();
      const hour24 = period === 'pm' && hr !== 12 ? hr + 12 : hr;
      if (hour24 < 12)        params.preferredTime = 'Morning (8–11 AM)';
      else if (hour24 < 17)   params.preferredTime = 'Afternoon (12–3 PM)';
      else if (hour24 < 21)   params.preferredTime = 'Evening (6–9 PM)';
      else                    params.preferredTime = 'Late Night';
    }
  }

  // Deadline hint (for command building)
  if (/tomorrow/.test(lower)) params.deadline = 'tomorrow';
  else if (/today/.test(lower)) params.deadline = 'today';
  else if (/monday|tuesday|wednesday|thursday|friday|saturday|sunday/.test(lower)) {
    const dayMatch = lower.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
    if (dayMatch) params.deadline = dayMatch[1];
  } else {
    params.deadline = 'tomorrow'; // sensible default
  }

  return params;
}

// ─── Intent Detection (Weighted Scoring) ─────────────────────────────────────

function detectIntent(text: string): IntentType {
  const lower = text.toLowerCase();

  const scores: Record<IntentType, number> = {
    'schedule-task': 0,
    'rescue-plan': 0,
    'plan-week': 0,
    'placement-roadmap': 0,
    'optimize-calendar': 0,
    'general': 1,
  };

  // schedule-task
  ['schedule', 'study', 'practice', 'revise', 'revision', 'exam', 'prepare',
   'learn', 'solve', 'complete', 'assignment', 'create task', 'add task', 'task for',
   'tomorrow', 'tonight', 'this evening', 'this morning'].forEach(s => {
    if (lower.includes(s)) scores['schedule-task'] += 1;
  });
  // Bonus if a known subject is detected
  if (detectSubject(lower)) scores['schedule-task'] += 2;

  // rescue-plan
  ['rescue', 'emergency', 'urgent', 'overdue', 'failing', 'panicking', 'help me',
   'running out of time', 'deadline tonight', 'due tomorrow', 'worried about'].forEach(s => {
    if (lower.includes(s)) scores['rescue-plan'] += 2;
  });

  // plan-week (needs strong multi-word signals)
  ['plan my week', 'weekly plan', 'plan week', 'plan for the week',
   'organize my week', 'schedule for the week'].forEach(s => {
    if (lower.includes(s)) scores['plan-week'] += 4;
  });
  if (/week/.test(lower) && /plan|schedule|organize/.test(lower)) scores['plan-week'] += 2;

  // placement-roadmap
  ['placement', 'roadmap', 'interview prep', 'faang', 'google', 'microsoft',
   'amazon', 'career', 'job prep', 'campus placement'].forEach(s => {
    if (lower.includes(s)) scores['placement-roadmap'] += 2;
  });

  // optimize-calendar
  ['optimize', 'reschedule', 'conflicts', 'overlap', 'free up', 'clean calendar',
   'reorganize', 'fix calendar', 'calendar conflicts'].forEach(s => {
    if (lower.includes(s)) scores['optimize-calendar'] += 2;
  });
  if (/calendar/.test(lower) && !/create|add|schedule/.test(lower)) {
    scores['optimize-calendar'] += 1;
  }

  // Return highest scoring intent
  let maxScore = 0;
  let result: IntentType = 'general';
  for (const [intent, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      result = intent as IntentType;
    }
  }
  return result;
}

// ─── Follow-up Questions (Respects Pre-filled Params) ─────────────────────────

function getFollowUpQuestions(
  intent: IntentType,
  initialText: string,
  preFilledParams: CollectedParams
): FollowUpQuestion[] {
  const lower = initialText.toLowerCase();

  switch (intent) {
    case 'schedule-task': {
      const questions: FollowUpQuestion[] = [];

      // Ask topic only if no subject detected
      const hasSubject = detectSubject(lower) !== null;
      if (!hasSubject && !preFilledParams.topic) {
        questions.push({
          id: 'q-topic',
          question: 'Which topic would you like to study?',
          placeholder: 'e.g. SQL Joins, Dynamic Programming, React Hooks...',
          type: 'chips',
          options: ['SQL', 'DSA / Arrays', 'Graph Algorithms', 'React Hooks', 'System Design', 'Dynamic Programming'],
          paramKey: 'topic',
          required: true,
        });
      }

      // Ask duration only if not already extracted
      if (!preFilledParams.duration) {
        questions.push({
          id: 'q-duration',
          question: 'How long would you like to study?',
          placeholder: 'e.g. 2 hours, 90 minutes...',
          type: 'chips',
          options: ['30 minutes', '1 hour', '2 hours', '3 hours', '4+ hours'],
          paramKey: 'duration',
          required: true,
        });
      }

      // Ask time only if not already extracted
      if (!preFilledParams.preferredTime) {
        questions.push({
          id: 'q-time',
          question: 'Which time works best for you?',
          placeholder: '',
          type: 'chips',
          options: ['Morning (8–11 AM)', 'Afternoon (12–3 PM)', 'Evening (6–9 PM)', 'Late Night'],
          paramKey: 'preferredTime',
          required: true,
        });
      }

      // Always ask about revision session (it's a preference)
      questions.push({
        id: 'q-revision',
        question: 'Should I also schedule a quick revision session the next day?',
        placeholder: '',
        type: 'chips',
        options: ['Yes, schedule revision', 'No, just the main session'],
        paramKey: 'addRevision',
        required: true,
      });

      return questions;
    }

    case 'rescue-plan': {
      const questions: FollowUpQuestion[] = [];
      // Check if subject already known from initial text
      const subject = detectSubject(lower);
      if (!subject) {
        questions.push({
          id: 'q-task',
          question: 'Which subject or task are you worried about?',
          placeholder: 'e.g. DAA Exam, React Project, OS Assignment...',
          type: 'text',
          paramKey: 'taskName',
          required: true,
        });
      }
      questions.push(
        {
          id: 'q-deadline',
          question: 'How much time do you have remaining?',
          placeholder: '',
          type: 'chips',
          options: ['Less than 12 hours', '1 day', '2 days', '3+ days'],
          paramKey: 'timeLeft',
          required: true,
        },
        {
          id: 'q-coverage',
          question: 'How much of the syllabus have you covered so far?',
          placeholder: '',
          type: 'chips',
          options: ['0–25% (Just starting)', '25–50%', '50–75%', '75%+ (Almost done)'],
          paramKey: 'coverage',
          required: true,
        }
      );
      return questions;
    }

    case 'plan-week':
      return [
        {
          id: 'q-subjects',
          question: 'Which subjects or projects should I include in your plan?',
          placeholder: 'e.g. DSA, React, System Design, OS...',
          type: 'text',
          paramKey: 'subjects',
          required: true,
        },
        {
          id: 'q-hours',
          question: 'How many hours per day can you commit to studying?',
          placeholder: '',
          type: 'chips',
          options: ['2 hours', '4 hours', '6 hours', '8+ hours'],
          paramKey: 'hoursPerDay',
          required: true,
        },
        {
          id: 'q-priority',
          question: 'What is your top priority this week?',
          placeholder: '',
          type: 'chips',
          options: ['Placement interviews', 'Upcoming exam', 'Project deadline', 'Building new skills'],
          paramKey: 'priority',
          required: true,
        },
      ];

    case 'placement-roadmap':
      return [
        {
          id: 'q-companies',
          question: 'Which type of companies are you targeting?',
          placeholder: '',
          type: 'chips',
          options: ['FAANG / Big Tech', 'Product-based companies', 'Service companies', 'Startups'],
          paramKey: 'targetCompanies',
          required: true,
        },
        {
          id: 'q-timeline',
          question: 'How long until your placement season starts?',
          placeholder: '',
          type: 'chips',
          options: ['Less than 1 month', '2–3 months', '4–6 months', '6+ months'],
          paramKey: 'timeline',
          required: true,
        },
        {
          id: 'q-weak',
          question: 'What are your weakest areas that need the most work?',
          placeholder: 'e.g. Dynamic Programming, System Design, OS Concepts...',
          type: 'text',
          paramKey: 'weakAreas',
          required: true,
        },
      ];

    default:
      return [];
  }
}

// ─── Confirmation Summary ─────────────────────────────────────────────────────

function generateConfirmationSummary(
  intent: IntentType,
  params: CollectedParams,
  initial: string,
  extractedTitle: string
): string {
  const timeLabel = (t: string) =>
    t.replace(' (8–11 AM)', '').replace(' (12–3 PM)', '').replace(' (6–9 PM)', '').trim();

  switch (intent) {
    case 'schedule-task': {
      const dur = params.duration || '2 hours';
      const time = params.preferredTime ? timeLabel(params.preferredTime) : 'Evening';
      const deadline = params.deadline || 'tomorrow';
      const revision = params.addRevision?.includes('Yes');
      return `Schedule **${extractedTitle}** · **${dur}** · **${time}** · **${deadline}**${revision ? ' · + revision next day' : ''}.`;
    }
    case 'rescue-plan': {
      const task = params.taskName || extractedTitle;
      return `Emergency rescue plan for **${task}** · **${params.timeLeft}** left · **${params.coverage}** coverage.`;
    }
    case 'plan-week':
      return `Weekly plan for **${params.subjects}** · **${params.hoursPerDay}** daily · Priority: **${params.priority}**.`;
    case 'placement-roadmap':
      return `Placement roadmap for **${params.targetCompanies}** · **${params.timeline}** timeline · Focusing on **${params.weakAreas}**.`;
    case 'optimize-calendar':
      return 'Optimize your entire calendar — remove conflicts, redistribute focus blocks.';
    default:
      return initial;
  }
}

// ─── AI Command Builder ────────────────────────────────────────────────────────

function buildAICommand(
  intent: IntentType,
  initialText: string,
  params: CollectedParams,
  extractedTitle: string
): string {
  const deadline = params.deadline || 'tomorrow';

  // Map chip label to a clean time string
  const timeMap: Record<string, string> = {
    'Morning (8–11 AM)': '9:00 AM',
    'Afternoon (12–3 PM)': '1:00 PM',
    'Evening (6–9 PM)': '6:00 PM',
    'Late Night': '10:00 PM',
  };
  const timeStr = timeMap[params.preferredTime] || params.preferredTime || '6:00 PM';

  switch (intent) {
    case 'schedule-task': {
      const topic = params.topic || detectSubject(initialText) || extractedTitle;
      const duration = params.duration || '2 hours';
      const revision = params.addRevision?.includes('Yes');
      return (
        `Create a task titled "${extractedTitle}". ` +
        `Topic: ${topic}. ` +
        `Schedule it for ${deadline} at ${timeStr}. ` +
        `Duration: ${duration}. ` +
        (revision ? `Also create a 30-minute revision task for the following day at the same time. ` : '') +
        `Original request: "${initialText}".`
      );
    }

    case 'rescue-plan': {
      const task = params.taskName || extractedTitle;
      return (
        `Emergency rescue mode for task titled "${task}". ` +
        `Time remaining: ${params.timeLeft}. ` +
        `Syllabus coverage so far: ${params.coverage}. ` +
        `Generate a priority-ordered emergency study plan with focused milestones. ` +
        `Lock focus blocks in calendar immediately.`
      );
    }

    case 'plan-week':
      return (
        `Create a weekly study plan starting tomorrow. ` +
        `Title: "Weekly Study Plan - ${params.subjects}". ` +
        `Subjects to cover: ${params.subjects}. ` +
        `Daily study time available: ${params.hoursPerDay}. ` +
        `Top priority: ${params.priority}. ` +
        `Distribute tasks across 7 days with calendar time blocks.`
      );

    case 'placement-roadmap':
      return (
        `Create a structured placement preparation roadmap. ` +
        `Title: "Placement Preparation Roadmap". ` +
        `Target companies: ${params.targetCompanies}. ` +
        `Timeline until placement: ${params.timeline}. ` +
        `Weak areas to focus on: ${params.weakAreas}. ` +
        `Create milestones for each week with specific topics and daily tasks.`
      );

    case 'optimize-calendar':
      return 'Optimize and reschedule my calendar. Remove all scheduling conflicts, redistribute focus blocks for peak productivity, and eliminate overlapping sessions.';

    default:
      return initialText;
  }
}

// ─── Success Message Generator ────────────────────────────────────────────────

function generateSuccessMessage(
  intent: IntentType,
  params: CollectedParams,
  extractedTitle: string,
  _aiReply: string
): string {
  const timeLabel = (t: string) =>
    t.replace(' (8–11 AM)', '').replace(' (12–3 PM)', '').replace(' (6–9 PM)', '').trim().toLowerCase();

  switch (intent) {
    case 'schedule-task': {
      const dur = params.duration || '2 hours';
      const time = params.preferredTime ? timeLabel(params.preferredTime) : 'this evening';
      const deadline = params.deadline || 'tomorrow';
      const revision = params.addRevision?.includes('Yes');
      return (
        `Done! I've scheduled your **${extractedTitle}** session — **${dur}** ${time}, **${deadline}**. ` +
        `I've also blocked the time in your calendar${revision ? ' and added a revision session for the following day' : ''}. ` +
        `Your dashboard, XP, and streak have all been updated. 🎯`
      );
    }

    case 'rescue-plan': {
      const task = params.taskName || extractedTitle;
      return (
        `Rescue Mode activated for **${task}**! I've created an emergency study plan with priority milestones, ` +
        `locked focused time blocks in your calendar, and set your risk score. ` +
        `Work through the rescue steps in order — you've got this! 💪`
      );
    }

    case 'plan-week':
      return (
        `Your weekly plan is live! I've scheduled **${params.subjects}** across 7 days ` +
        `with **${params.hoursPerDay}** of focused study each day, prioritizing **${params.priority}**. ` +
        `All sessions are in your calendar. Have a productive week! 📅`
      );

    case 'placement-roadmap':
      return (
        `Your placement roadmap is ready! I've built a structured **${params.timeline}** preparation plan ` +
        `targeting **${params.targetCompanies}** companies, with special focus on **${params.weakAreas}**. ` +
        `Start with today's milestone — the path to your dream company begins now! 🚀`
      );

    case 'optimize-calendar':
      return (
        `Calendar optimized! I've eliminated all conflicts, redistributed your focus blocks for ` +
        `peak performance, and aligned sessions with your energy patterns. Everything is clean and synced. ⚡`
      );

    default:
      return _aiReply || `Done! Your request has been processed and everything has been updated in your workspace.`;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useKaiConversation(
  runAICommand: (command: string) => Promise<string>,
  fetchUserState: () => Promise<void>,
) {
  const [messages, setMessages] = useState<KaiMessage[]>([]);
  const [orbState, setOrbState] = useState<KaiOrbState>('idle');
  const [phase, setPhase] = useState<ConversationPhase>('idle');
  const [isTyping, setIsTyping] = useState(false);

  // Conversation state refs
  const pendingIntentRef    = useRef<IntentType>('general');
  const initialTextRef      = useRef<string>('');
  const extractedTitleRef   = useRef<string>('');
  const followUpQueueRef    = useRef<FollowUpQuestion[]>([]);
  const collectedParamsRef  = useRef<CollectedParams>({});
  const currentQuestionIndexRef = useRef<number>(0);
  const lastCommandRef      = useRef<string>('');

  const addMessage = useCallback((role: KaiMessageRole, text: string, card?: KaiSmartCard): KaiMessage => {
    const msg: KaiMessage = {
      id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      text,
      timestamp: new Date(),
      card,
    };
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  // Streaming text animation
  const streamKaiResponse = useCallback((text: string, card?: KaiSmartCard): Promise<void> => {
    return new Promise(resolve => {
      const msgId = `kai-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const words = text.split(' ');
      let index = 0;

      setIsTyping(true);
      setMessages(prev => [
        ...prev,
        { id: msgId, role: 'kai', text: '', timestamp: new Date(), isStreaming: true },
      ]);

      const interval = setInterval(() => {
        if (index >= words.length) {
          clearInterval(interval);
          setMessages(prev =>
            prev.map(m =>
              m.id === msgId ? { ...m, text, isStreaming: false, card } : m
            )
          );
          setIsTyping(false);
          resolve();
          return;
        }
        const chunk = words.slice(0, index + 1).join(' ');
        setMessages(prev =>
          prev.map(m => m.id === msgId ? { ...m, text: chunk } : m)
        );
        index++;
      }, 28);
    });
  }, []);

  // Ask the next follow-up question in the queue
  const askNextFollowUp = useCallback(async () => {
    const queue = followUpQueueRef.current;
    const idx   = currentQuestionIndexRef.current;

    if (idx >= queue.length) {
      // All answered — build confirmation card
      setPhase('confirming');
      const intent         = pendingIntentRef.current;
      const params         = collectedParamsRef.current;
      const initial        = initialTextRef.current;
      const extractedTitle = extractedTitleRef.current;
      const command        = buildAICommand(intent, initial, params, extractedTitle);
      lastCommandRef.current = command;

      const confirmCard: KaiSmartCard = {
        type: 'confirmation',
        data: {
          command,
          intent,
          params,
          extractedTitle,
          summary: generateConfirmationSummary(intent, params, initial, extractedTitle),
        },
      };

      setOrbState('thinking');
      await streamKaiResponse(`Here's what I'll create — does this look right?`, confirmCard);
      setOrbState('idle');
      return;
    }

    const q = queue[idx];
    setOrbState('thinking');

    const card: KaiSmartCard = {
      type: 'followup',
      data: { question: q },
    };

    await streamKaiResponse(q.question, card);
    setOrbState('idle');
  }, [streamKaiResponse]);

  // Execute confirmed command against real backend
  const executeConfirmedCommand = useCallback(async () => {
    setPhase('executing');
    setOrbState('thinking');

    const intent         = pendingIntentRef.current;
    const params         = collectedParamsRef.current;
    const initial        = initialTextRef.current;
    const extractedTitle = extractedTitleRef.current;
    const command        = lastCommandRef.current || buildAICommand(intent, initial, params, extractedTitle);

    try {
      await streamKaiResponse(`On it — creating your ${extractedTitle || 'plan'} now...`);

      const aiReply = await runAICommand(command);

      // Check for error response from AppContext
      const isErrorResponse =
        !aiReply ||
        aiReply.includes('could not be reached') ||
        aiReply.includes('Command Center failed') ||
        aiReply.includes('server could not');

      if (isErrorResponse) {
        throw new Error('Backend unreachable');
      }

      // fetchUserState is called inside runAICommand already; no-op here is fine
      await fetchUserState();

      // Generate natural, context-aware success message (never use raw AI reply as-is)
      const successMessage = generateSuccessMessage(intent, params, extractedTitle, aiReply);

      const successCard: KaiSmartCard = {
        type: 'task-created',
        data: {
          intent,
          params,
          extractedTitle,
          duration:       params.duration,
          scheduledTime:  params.preferredTime,
          deadline:       params.deadline,
          addedRevision:  params.addRevision?.includes('Yes'),
          taskName:       params.taskName,
        },
      };

      await streamKaiResponse(successMessage, successCard);
      setPhase('done');
    } catch {
      await streamKaiResponse(
        `I couldn't generate a response right now. The server may be temporarily unavailable — please check that it's running on port 5000 and try again.`,
        {
          type: 'analytics',
          data: { error: true, retryCommand: command },
        }
      );
      setPhase('idle');
    } finally {
      setOrbState('idle');
    }
  }, [streamKaiResponse, runAICommand, fetchUserState]);

  // Main message handler
  const handleUserMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    addMessage('user', text);

    // ── Phase: follow-up ──────────────────────────────────────────────────
    if (phase === 'followup') {
      const queue = followUpQueueRef.current;
      const idx   = currentQuestionIndexRef.current;
      if (idx < queue.length) {
        const currentQ = queue[idx];
        collectedParamsRef.current[currentQ.paramKey] = text;
        currentQuestionIndexRef.current += 1;
        await askNextFollowUp();
      }
      return;
    }

    // ── Phase: confirming ──────────────────────────────────────────────────
    if (phase === 'confirming') {
      const lower = text.toLowerCase().trim();
      const confirmed =
        /^(yes|y|yep|yeah|sure|ok|okay|confirm|proceed|do it|go ahead|correct|right|looks good|perfect|sounds good)/.test(lower) ||
        lower.includes('yes') || lower.includes('confirm') || lower.includes('proceed');

      if (confirmed) {
        await executeConfirmedCommand();
      } else {
        // Reset and invite new request
        setPhase('idle');
        followUpQueueRef.current        = [];
        currentQuestionIndexRef.current = 0;
        collectedParamsRef.current      = {};
        extractedTitleRef.current       = '';
        await streamKaiResponse(
          `No problem — let's start fresh! What would you like to plan?`
        );
      }
      return;
    }

    // ── New intent ────────────────────────────────────────────────────────
    const intent         = detectIntent(text);
    const extractedTitle = extractTaskTitle(text, intent);
    const initialParams  = extractInitialParams(text);

    pendingIntentRef.current        = intent;
    initialTextRef.current          = text;
    extractedTitleRef.current       = extractedTitle;
    collectedParamsRef.current      = { ...initialParams };
    currentQuestionIndexRef.current = 0;

    // optimize-calendar: no follow-ups needed
    if (intent === 'optimize-calendar') {
      setPhase('executing');
      lastCommandRef.current = buildAICommand(intent, text, initialParams, extractedTitle);
      setOrbState('thinking');
      await streamKaiResponse(`Sure — let me scan your calendar and resolve all conflicts right now...`);
      await executeConfirmedCommand();
      return;
    }

    const followUpQuestions = getFollowUpQuestions(intent, text, initialParams);

    // general / no known intent: ask AI directly
    if (intent === 'general' || followUpQuestions.length === 0) {
      setPhase('executing');
      setOrbState('thinking');
      await streamKaiResponse(`Let me think about that...`);
      try {
        const reply = await runAICommand(text);
        if (!reply || reply.includes('could not be reached')) throw new Error('offline');
        await streamKaiResponse(reply);
        await fetchUserState();
      } catch {
        await streamKaiResponse(
          `I couldn't understand that clearly. Could you rephrase? Try something like "Schedule SQL for 2 hours tomorrow evening" or "Help me prepare for my DAA exam."`
        );
      }
      setPhase('done');
      setOrbState('idle');
      return;
    }

    // Begin follow-up sequence
    followUpQueueRef.current = followUpQuestions;
    setPhase('followup');

    // Give a natural acknowledgement before first follow-up
    const acknowledgements: Record<IntentType, string> = {
      'schedule-task':    `Sure, I'd love to schedule that for you. Just a couple of quick questions first.`,
      'rescue-plan':      `Rescue Mode incoming! Let me gather some details so I can build the best plan for you.`,
      'plan-week':        `A solid weekly plan — great idea. Tell me a bit more and I'll make it happen.`,
      'placement-roadmap': `Placement roadmap time! I need a few details to build the right path for you.`,
      'optimize-calendar': `On it!`,
      'general':           `Let me help with that.`,
    };

    setOrbState('thinking');
    await streamKaiResponse(acknowledgements[intent]);
    setOrbState('idle');

    await askNextFollowUp();
  }, [phase, addMessage, askNextFollowUp, streamKaiResponse, runAICommand, fetchUserState, executeConfirmedCommand]);

  // Chip answer handler (from smart cards)
  const handleChipAnswer = useCallback(async (answer: string) => {
    await handleUserMessage(answer);
  }, [handleUserMessage]);

  // Confirm from confirmation card button
  const handleConfirm = useCallback(async () => {
    await executeConfirmedCommand();
  }, [executeConfirmedCommand]);

  // Cancel from confirmation card button
  const handleCancel = useCallback(async () => {
    setPhase('idle');
    followUpQueueRef.current        = [];
    currentQuestionIndexRef.current = 0;
    collectedParamsRef.current      = {};
    extractedTitleRef.current       = '';
    await streamKaiResponse(`Cancelled. What else can I help you with?`);
  }, [streamKaiResponse]);

  // Retry last command (from error card)
  const handleRetryCommand = useCallback(async () => {
    const cmd = lastCommandRef.current;
    if (!cmd) return;
    setPhase('executing');
    setOrbState('thinking');
    try {
      await streamKaiResponse(`Retrying...`);
      const reply = await runAICommand(cmd);
      if (!reply || reply.includes('could not be reached')) throw new Error('offline');
      const successMessage = generateSuccessMessage(
        pendingIntentRef.current,
        collectedParamsRef.current,
        extractedTitleRef.current,
        reply
      );
      await streamKaiResponse(successMessage, {
        type: 'task-created',
        data: {
          intent: pendingIntentRef.current,
          params: collectedParamsRef.current,
          extractedTitle: extractedTitleRef.current,
          duration: collectedParamsRef.current.duration,
          scheduledTime: collectedParamsRef.current.preferredTime,
        },
      });
      await fetchUserState();
      setPhase('done');
    } catch {
      await streamKaiResponse(
        `Still unable to reach the server. Please make sure the backend is running on port 5000.`
      );
      setPhase('idle');
    } finally {
      setOrbState('idle');
    }
  }, [streamKaiResponse, runAICommand, fetchUserState]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setPhase('idle');
    setOrbState('idle');
    setIsTyping(false);
    followUpQueueRef.current        = [];
    currentQuestionIndexRef.current = 0;
    collectedParamsRef.current      = {};
    pendingIntentRef.current        = 'general';
    initialTextRef.current          = '';
    extractedTitleRef.current       = '';
    lastCommandRef.current          = '';
  }, []);

  return {
    messages,
    orbState,
    setOrbState,
    phase,
    isTyping,
    handleUserMessage,
    handleChipAnswer,
    handleConfirm,
    handleCancel,
    handleRetryCommand,
    clearConversation,
    addMessage,
  };
}
