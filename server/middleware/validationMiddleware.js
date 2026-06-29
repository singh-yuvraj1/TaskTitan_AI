// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valid Priorities
const VALID_PRIORITIES = [
  'Urgent-Important',
  'NotUrgent-Important',
  'Urgent-NotImportant',
  'NotUrgent-NotImportant'
];

export const validateSignup = (req, res, next) => {
  const { email, password, name } = req.body;

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.'
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required.'
    });
  }

  next();
};

export const validateTask = (req, res, next) => {
  const { title, deadline, priority, description } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Task title is required and must be a valid text string.'
    });
  }

  if (description && typeof description !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Task description must be a string.'
    });
  }

  if (!deadline || isNaN(Date.parse(deadline))) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid deadline date string.'
    });
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: `Invalid priority level. Allowed levels: ${VALID_PRIORITIES.join(', ')}`
    });
  }

  next();
};

export const validateDateString = (dateStr) => {
  return dateStr && !isNaN(Date.parse(dateStr));
};
