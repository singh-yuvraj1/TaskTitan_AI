import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper to determine failure risk, priority, and category heuristically
const computeHeuristics = (title, desc, deadlineStr) => {
  const t = (title || '').toLowerCase() + ' ' + (desc || '').toLowerCase();
  let category = 'General';
  if (t.includes('dsa') || t.includes('array') || t.includes('tree') || t.includes('graph') || t.includes('leetcode') || t.includes('sort') || t.includes('search')) {
    category = 'DSA';
  } else if (t.includes('react') || t.includes('component') || t.includes('hook') || t.includes('context') || t.includes('redux') || t.includes('router') || t.includes('frontend')) {
    category = 'React';
  } else if (t.includes('vite') || t.includes('webpack') || t.includes('tailwind') || t.includes('css') || t.includes('html')) {
    category = 'WebDev';
  } else if (t.includes('node') || t.includes('backend') || t.includes('express') || t.includes('database') || t.includes('sql') || t.includes('mongodb') || t.includes('api')) {
    category = 'Backend';
  } else if (t.includes('system') || t.includes('architecture') || t.includes('design') || t.includes('scale') || t.includes('docker')) {
    category = 'System Design';
  }

  // Calculate hours until deadline
  const diffMs = new Date(deadlineStr).getTime() - new Date().getTime();
  const diffHours = Math.max(0.1, diffMs / (1000 * 60 * 60));

  let priority = 'NotUrgent-Important';
  if (diffHours < 24) {
    priority = 'Urgent-Important';
  } else if (diffHours < 72) {
    priority = 'Urgent-NotImportant';
  }

  // Failure risk
  let failureProbability = 15;
  let failureReason = 'Progress looks stable. There is ample time to compile and test before submission.';
  let suggestedAction = 'Start with standard Pomodoro blocks when convenient.';

  if (diffHours < 12) {
    failureProbability = 82;
    failureReason = `This task is due in only ${diffHours.toFixed(1)} hours. Based on standard completion velocity, the remaining scope exceeds the available time window.`;
    suggestedAction = 'Trigger Deadline Rescue Mode immediately! Delay secondary tasks and engage deep focus.';
  } else if (diffHours < 36) {
    failureProbability = 54;
    failureReason = `Only ${diffHours.toFixed(1)} hours remaining. Your usual active coding window does not align fully with this deadline.`;
    suggestedAction = 'Block out 2 hours of Deep Focus tonight. Set a strict deadline reminder.';
  } else if (t.includes('hard') || t.includes('dp') || t.includes('redux') || t.includes('ssl')) {
    failureProbability = 40;
    failureReason = 'Complexity factor is high. These technologies historically lead to integration debugging delays.';
    suggestedAction = 'Decompose complex hook structures early. Write simple unit tests before finalizing bundle.';
  }

  return { category, priority, failureProbability, failureReason, suggestedAction };
};

export const generateTaskDecomposition = async (title, desc, deadline, customKey) => {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  const heuristics = computeHeuristics(title, desc, deadline);

  if (!apiKey) {
    let subtasks = [
      { id: 'sub-m-1', title: 'Initialize task setup & parameters', completed: false, estimatedMinutes: 30 },
      { id: 'sub-m-2', title: 'Core implementation logic', completed: false, estimatedMinutes: 120 },
      { id: 'sub-m-3', title: 'Test execution & code review', completed: false, estimatedMinutes: 45 },
    ];

    if (heuristics.category === 'DSA') {
      subtasks = [
        { id: 'sub-d-1', title: 'Analyze corner cases & edge constraints', completed: false, estimatedMinutes: 45 },
        { id: 'sub-d-2', title: 'Implement logic using optimal data structure', completed: false, estimatedMinutes: 90 },
        { id: 'sub-d-3', title: 'Optimize time & space complexity checks', completed: false, estimatedMinutes: 45 },
      ];
    } else if (heuristics.category === 'React') {
      subtasks = [
        { id: 'sub-r-1', title: 'Setup component interfaces & skeleton code', completed: false, estimatedMinutes: 30 },
        { id: 'sub-r-2', title: 'Implement state Hooks & event handlers', completed: false, estimatedMinutes: 120 },
        { id: 'sub-r-3', title: 'Apply CSS styling & test responsive viewport', completed: false, estimatedMinutes: 60 },
      ];
    }

    return {
      subtasks,
      ...heuristics,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are the TaskTitan-AI Planner and Prioritizer Agent.
    Decompose the following task into a list of 3 detailed subtasks, assign a category, priority level, and predict task failure risk.
    Task Title: "${title}"
    Task Description: "${desc}"
    Deadline: "${deadline}" (current time is ${new Date().toISOString()})

    Return ONLY a JSON object matching this structure:
    {
      "subtasks": [
        {"title": "Subtask title here", "estimatedMinutes": 45}
      ],
      "category": "DSA" | "React" | "WebDev" | "Backend" | "System Design" | "General",
      "priority": "Urgent-Important" | "NotUrgent-Important" | "Urgent-NotImportant" | "NotUrgent-NotImportant",
      "failureProbability": 65,
      "failureReason": "A brief explanation of why this task might fail",
      "suggestedAction": "Suggested quick action to prevent failure"
    }`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const cleanText = text.replace(/```json/i, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanText);

    const formattedSubtasks = result.subtasks.map((st, idx) => ({
      id: `sub-ai-${Date.now()}-${idx}`,
      title: st.title || 'Subtask',
      completed: false,
      estimatedMinutes: Number(st.estimatedMinutes) || 45,
    }));

    return {
      subtasks: formattedSubtasks,
      category: result.category || heuristics.category,
      priority: result.priority || heuristics.priority,
      failureProbability: Number(result.failureProbability) || heuristics.failureProbability,
      failureReason: result.failureReason || heuristics.failureReason,
      suggestedAction: result.suggestedAction || heuristics.suggestedAction,
    };
  } catch (error) {
    console.error('Gemini API call failed, falling back to heuristics:', error);
    return {
      subtasks: [
        { id: `sub-fallback-${Date.now()}-1`, title: 'Setup task boundaries', completed: false, estimatedMinutes: 45 },
        { id: `sub-fallback-${Date.now()}-2`, title: 'Core sprint and debugging', completed: false, estimatedMinutes: 120 },
        { id: `sub-fallback-${Date.now()}-3`, title: 'Quality assurance checklist', completed: false, estimatedMinutes: 45 }
      ],
      ...heuristics
    };
  }
};

export const generateRescueTimeline = async (title, hoursRemaining, customKey) => {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  const defaultSteps = [
    { id: 'res-1', label: 'Setup workspace & remove distractions', durationMinutes: 10, completed: false, sequence: 1 },
    { id: 'res-2', label: 'Core coding sprint (no-context switching)', durationMinutes: Math.round(hoursRemaining * 30), completed: false, sequence: 2 },
    { id: 'res-3', label: 'Smoke testing & formatting verification', durationMinutes: Math.min(30, Math.round(hoursRemaining * 10)), completed: false, sequence: 3 },
    { id: 'res-4', label: 'Deployment bundle check & upload submission', durationMinutes: 15, completed: false, sequence: 4 },
  ];

  if (!apiKey) {
    return defaultSteps;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are the TaskTitan-AI Rescue Agent.
    Generate a highly tactical, minute-by-minute Emergency Rescue Plan to successfully complete this task.
    Task Title: "${title}"
    Hours remaining: ${hoursRemaining.toFixed(1)} hours

    Return ONLY a JSON array matching this structure:
    [
      { "label": "Step action name", "durationMinutes": 30 }
    ]
    Ensure the sum of durationMinutes matches roughly 60% of the available time to leave a safety buffer. Limit the steps to 4.`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const cleanText = text.replace(/```json/i, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    return parsed.map((item, idx) => ({
      id: `res-ai-${Date.now()}-${idx}`,
      label: item.label,
      durationMinutes: Number(item.durationMinutes) || 30,
      completed: false,
      sequence: idx + 1,
    }));
  } catch (error) {
    console.error('Gemini Rescue Engine failed, falling back to default:', error);
    return defaultSteps;
  }
};

export const generateCoachFeedback = async (statusSummary, customKey) => {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const responses = [
      "Your focus has been strong in React, but your DSA skills are lagging. Let's tackle that DAA Dynamic Programming task before it gets too late!",
      "Ninja, you are on a 3-day coding streak! Protect it at all costs today. Just 10 more minutes of focus completes your daily goal.",
      "Detecting signs of stress from high workloads. I recommend skipping minor tasks today and resting early.",
      "Excellent work! You completed your rescue plan ahead of time. You earned +50 XP."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are the TaskTitan-AI Coach Agent.
    Review the user's statistics summary below and provide a concise (max 2 sentences), highly motivational advice.
    Address them as "Ninja" or similar developer terms.
    User Stats: ${statusSummary}`;

    const response = await model.generateContent(prompt);
    return response.response.text().trim();
  } catch (error) {
    console.error('Gemini Coach failed:', error);
    return "Keep coding, Ninja! You have what it takes to finish your goals today.";
  }
};

export const processVoiceCommand = async (transcript, customKey) => {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  const cleaned = (transcript || '').toLowerCase().trim();

  let reply = "I've processed your request.";
  let action = 'recommendation';
  let data = {};

  if (cleaned.includes('schedule') || cleaned.includes('create') || cleaned.includes('add task')) {
    action = 'create_task';
    let title = 'New Voice Task';
    let deadline = new Date();
    deadline.setDate(deadline.getDate() + 1);

    if (cleaned.includes('dsa')) {
      title = 'Study DSA and algorithms';
    } else if (cleaned.includes('react')) {
      title = 'Code React project features';
    } else {
      const match = transcript.match(/(?:schedule|create|add)\s+(.+?)(?:\s+tomorrow|\s+for|\s+at|$)/i);
      if (match && match[1]) title = match[1];
    }

    if (cleaned.includes('tomorrow')) {
      deadline.setDate(deadline.getDate() + 1);
    } else if (cleaned.includes('friday')) {
      const currentDay = new Date().getDay();
      const distance = (5 - currentDay + 7) % 7;
      deadline.setDate(deadline.getDate() + (distance === 0 ? 7 : distance));
    }

    reply = `Task "${title}" created successfully and scheduled for ${deadline.toLocaleDateString()}.`;
    data = { title, description: 'Created via Gemini Voice Assistant.', deadline: deadline.toISOString() };
  } else if (cleaned.includes('focus') || cleaned.includes('pomodoro') || cleaned.includes('timer') || cleaned.includes('start')) {
    action = 'start_pomodoro';
    reply = "Focus mode activated! Initiating 25-minute Pomodoro timer.";
  } else if (cleaned.includes('show') || cleaned.includes('go to') || cleaned.includes('open')) {
    action = 'show_section';
    let target = 'dashboard';
    if (cleaned.includes('rescue')) target = 'rescue';
    else if (cleaned.includes('calendar') || cleaned.includes('schedule')) target = 'calendar';
    else if (cleaned.includes('skills') || cleaned.includes('gamification')) target = 'skills';
    else if (cleaned.includes('dna') || cleaned.includes('habits')) target = 'dna';

    reply = `Navigating you to the ${target} module.`;
    data = { target };
  } else {
    reply = "I analyzed your productivity status. Based on your current calendar blocks, you have an open 2-hour window tonight. Shall we schedule a Pomodoro?";
  }

  if (!apiKey) {
    return { action, reply, data };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are the TaskTitan-AI Voice Assistant.
    Understand the user speech query and return a command action.
    User speech: "${transcript}"
    Current Date/Time: ${new Date().toISOString()}

    Return ONLY a JSON object matching this structure:
    {
      "action": "create_task" | "show_section" | "start_pomodoro" | "recommendation" | "error",
      "reply": "Speech feedback for user",
      "data": {
        "title": "task title if creating",
        "description": "task description if creating",
        "deadline": "ISO date string if creating",
        "target": "dashboard" | "rescue" | "calendar" | "skills" | "dna"
      }
    }`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const cleanText = text.replace(/```json/i, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    return {
      action: parsed.action || action,
      reply: parsed.reply || reply,
      data: parsed.data || data,
    };
  } catch (error) {
    console.error('Gemini Voice Assistant failed, using heuristics:', error);
    return { action, reply, data };
  }
};
