// Password validation rules
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!hasLowerCase) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!hasNumbers) {
    errors.push("Password must contain at least one number");
  }
  if (!hasSpecialChar) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Username validation rules
const validateUsername = (username) => {
  const minLength = 3;
  const maxLength = 20;
  const validChars = /^[a-zA-Z0-9_-]+$/;

  const errors = [];
  if (username.length < minLength) {
    errors.push(`Username must be at least ${minLength} characters long`);
  }
  if (username.length > maxLength) {
    errors.push(`Username must not exceed ${maxLength} characters`);
  }
  if (!validChars.test(username)) {
    errors.push("Username can only contain letters, numbers, underscores, and hyphens");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validatePassword,
  validateUsername
};