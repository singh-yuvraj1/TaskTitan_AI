// Recursively sanitize objects to prevent NoSQL injection by deleting keys starting with '$'
const cleanNoSql = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (key.startsWith('$')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        cleanNoSql(obj[key]);
      }
    }
  }
  return obj;
};

// Recursively escape strings to prevent basic HTML/XSS injection
const cleanXss = (value) => {
  if (typeof value === 'string') {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  if (value && typeof value === 'object') {
    for (const key in value) {
      value[key] = cleanXss(value[key]);
    }
  }
  
  return value;
};

export const sanitizeInput = (req, res, next) => {
  // 1. Sanitize against NoSQL injection
  if (req.body) cleanNoSql(req.body);
  if (req.query) cleanNoSql(req.query);
  if (req.params) cleanNoSql(req.params);

  // 2. Sanitize against XSS script injection
  if (req.body) cleanXss(req.body);
  if (req.query) cleanXss(req.query);
  if (req.params) cleanXss(req.params);

  next();
};
