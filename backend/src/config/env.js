const isPlaceholder = (value = '') => {
  const v = String(value).trim().toLowerCase();
  if (!v) return true;
  return (
    v.includes('your_') ||
    v.includes('<') ||
    v.includes('example.com') ||
    v === 'changeme' ||
    v === 'replace_me'
  );
};

const hasValue = (value) => !!String(value || '').trim();

const validateEnv = (logger) => {
  const required = ['MONGO_URI', 'JWT_SECRET', 'FRONTEND_URL', 'BACKEND_URL'];
  const missing = required.filter((key) => !hasValue(process.env[key]));

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (isPlaceholder(process.env.JWT_SECRET)) {
    logger.error('JWT_SECRET is using a placeholder. Set a strong secret in backend/.env');
    process.exit(1);
  }

  // OAuth provider configuration checks.
  const githubConfigured =
    hasValue(process.env.GITHUB_CLIENT_ID) &&
    hasValue(process.env.GITHUB_CLIENT_SECRET) &&
    !isPlaceholder(process.env.GITHUB_CLIENT_ID) &&
    !isPlaceholder(process.env.GITHUB_CLIENT_SECRET);

  const googleConfigured =
    hasValue(process.env.GOOGLE_CLIENT_ID) &&
    hasValue(process.env.GOOGLE_CLIENT_SECRET) &&
    !isPlaceholder(process.env.GOOGLE_CLIENT_ID) &&
    !isPlaceholder(process.env.GOOGLE_CLIENT_SECRET);

  if (!githubConfigured) {
    logger.warn('GitHub OAuth is not fully configured (GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET).');
  }

  if (!googleConfigured) {
    logger.warn('Google OAuth is not fully configured (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET).');
  }

  // Email configuration checks: require at least one working provider.
  const resendConfigured =
    hasValue(process.env.RESEND_API_KEY) &&
    !isPlaceholder(process.env.RESEND_API_KEY) &&
    process.env.RESEND_API_KEY !== 'your_resend_api_key';

  const smtpConfigured =
    hasValue(process.env.SMTP_USER) &&
    hasValue(process.env.SMTP_PASS) &&
    process.env.SMTP_USER !== 'your_email@gmail.com' &&
    process.env.SMTP_PASS !== 'your_email_password';

  if (!resendConfigured && !smtpConfigured) {
    logger.warn('No valid email provider configured. Set RESEND_API_KEY (+ RESEND_FROM) or SMTP_USER/SMTP_PASS.');
  }

  if (resendConfigured && !hasValue(process.env.RESEND_FROM)) {
    logger.warn('RESEND_FROM is missing. Use a verified sender, e.g. "DevTrack <noreply@your-domain.com>".');
  }

  if (hasValue(process.env.SMTP_USER) && !hasValue(process.env.SMTP_PASS)) {
    logger.warn('SMTP_USER is set but SMTP_PASS is missing.');
  }

  if (!hasValue(process.env.AI_SERVICE_URL)) {
    logger.warn('AI_SERVICE_URL is not set. Backend will use http://localhost:8000 by default.');
  }
};

module.exports = { validateEnv };
