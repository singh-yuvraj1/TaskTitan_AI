/**
 * Request Validation Schemas (Zod)
 * Provides type-safe validation for all API request bodies.
 * Each schema is paired with a middleware factory.
 */

import { z } from 'zod';

// ─── Reusable Primitives ──────────────────────────────────────────────────────

const emailSchema = z
  .string({ required_error: 'Email is required.' })
  .email('Please provide a valid email address.')
  .toLowerCase()
  .trim();

const passwordSchema = z
  .string({ required_error: 'Password is required.' })
  .min(6, 'Password must be at least 6 characters.');

const dateStringSchema = z
  .string({ required_error: 'Date is required.' })
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please provide a valid ISO date string.',
  });

const priorityEnum = z.enum(
  ['Urgent-Important', 'NotUrgent-Important', 'Urgent-NotImportant', 'NotUrgent-NotImportant'],
  { errorMap: () => ({ message: 'Invalid priority level.' }) }
);

const categoryEnum = z.enum(
  ['DSA', 'React', 'WebDev', 'Backend', 'System Design', 'Placement Prep', 'General'],
  { errorMap: () => ({ message: 'Invalid category.' }) }
);

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().max(100, 'Name must be 100 characters or less.').optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: 'Password is required.' }).min(1, 'Password is required.'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// ─── Task Schemas ─────────────────────────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required.' })
    .min(1, 'Task title cannot be empty.')
    .max(200, 'Task title must be 200 characters or less.')
    .trim(),
  description: z.string().max(2000, 'Description must be 2000 characters or less.').optional(),
  deadline: dateStringSchema,
  priority: priorityEnum.optional(),
  category: categoryEnum.optional(),
  estimatedHours: z.number().min(0.5).max(100).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(2000).optional(),
  deadline: dateStringSchema.optional(),
  priority: priorityEnum.optional(),
  category: categoryEnum.optional(),
  estimatedHours: z.number().min(0.5).max(100).optional(),
  completed: z.boolean().optional(),
  progress: z.number().min(0).max(100).optional(),
  subtasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    completed: z.boolean(),
    estimatedMinutes: z.number().optional()
  })).optional(),
  rescueTimeline: z.array(z.object({
    id: z.string(),
    label: z.string(),
    durationMinutes: z.number(),
    completed: z.boolean(),
    sequence: z.number()
  })).optional(),
});

// ─── Calendar Schemas ─────────────────────────────────────────────────────────

export const createCalendarEventSchema = z.object({
  event: z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Event title is required.').max(200).trim(),
    start: dateStringSchema,
    end: dateStringSchema,
    taskId: z.string().optional(),
    isAiScheduled: z.boolean().optional(),
  }).refine((data) => new Date(data.end) > new Date(data.start), {
    message: 'End time must be after start time.',
    path: ['end'],
  })
});

// ─── Habit Schemas ────────────────────────────────────────────────────────────

export const toggleHabitSchema = z.object({
  habitId: z
    .string({ required_error: 'Habit ID is required.' })
    .min(1, 'Habit ID cannot be empty.'),
});

// ─── Settings Schemas ─────────────────────────────────────────────────────────

export const updateSettingsSchema = z.object({
  name: z.string().max(100).optional(),
  theme: z.enum(['dark', 'light']).optional(),
  language: z.string().max(10).optional(),
  geminiApiKey: z.string().max(200).optional(),
  notificationPreferences: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    rescueAlerts: z.boolean().optional(),
  }).optional(),
});

// ─── Focus Session Schemas ────────────────────────────────────────────────────

export const startFocusSessionSchema = z.object({
  taskId: z.string().optional(),
  taskTitle: z.string().max(200).optional(),
  mode: z.enum(['pomodoro', 'deep', 'custom', 'short_break', 'long_break']).optional(),
  targetDurationMinutes: z.number().min(1).max(480).optional(),
  notes: z.string().max(500).optional(),
});

export const endFocusSessionSchema = z.object({
  sessionId: z.string().optional(),
  completed: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

// ─── Roadmap Schemas ──────────────────────────────────────────────────────────

export const createRoadmapSchema = z.object({
  title: z
    .string({ required_error: 'Roadmap title is required.' })
    .min(1, 'Title cannot be empty.')
    .max(200)
    .trim(),
  description: z.string().max(2000).optional(),
  category: categoryEnum.optional(),
  timeframe: z.enum(['weekly', 'monthly', 'custom']).optional(),
  targetDate: dateStringSchema,
  xpReward: z.number().min(0).max(1000).optional(),
  milestones: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1).max(200),
    description: z.string().max(500).optional(),
    estimatedHours: z.number().min(0.5).max(100).optional(),
    targetDate: z.string().optional(),
  })).max(20, 'Maximum 20 milestones per roadmap.').optional(),
});

export const updateRoadmapSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(2000).optional(),
  category: categoryEnum.optional(),
  targetDate: dateStringSchema.optional(),
  milestoneId: z.string().optional(),
  milestoneCompleted: z.boolean().optional(),
  milestones: z.array(z.object({
    id: z.string(),
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    completed: z.boolean().optional(),
    estimatedHours: z.number().optional(),
    targetDate: z.string().optional(),
  })).optional(),
});

// ─── AI Schemas ───────────────────────────────────────────────────────────────

export const aiCommandSchema = z.object({
  command: z
    .string({ required_error: 'Command is required.' })
    .min(1, 'Command cannot be empty.')
    .max(1000, 'Command is too long.'),
});

export const voiceCommandSchema = z.object({
  transcript: z
    .string({ required_error: 'Transcript is required.' })
    .min(1, 'Transcript cannot be empty.')
    .max(500, 'Transcript is too long.'),
});

// ─── Validation Middleware Factory ────────────────────────────────────────────

/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * On validation failure, returns 422 with structured error details.
 * On success, replaces req.body with the parsed (coerced) data.
 *
 * @param {z.ZodSchema} schema - The Zod schema to validate against
 * @returns Express middleware function
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.') || 'body',
      message: err.message,
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed. Please check your request.',
      data: null,
      errors,
    });
  }

  // Replace body with coerced/transformed data from Zod
  req.body = result.data;
  next();
};

export default {
  validate,
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  createTaskSchema,
  updateTaskSchema,
  createCalendarEventSchema,
  toggleHabitSchema,
  updateSettingsSchema,
  startFocusSessionSchema,
  endFocusSessionSchema,
  createRoadmapSchema,
  updateRoadmapSchema,
  aiCommandSchema,
  voiceCommandSchema,
};
