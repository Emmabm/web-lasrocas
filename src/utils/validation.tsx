/**
 * Validates an email address
 * @param email The email to validate
 * @returns Error message or empty string if valid
 */
export const validateEmail = (email: string): string => {
  if (!email) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return '';
};

/**
 * Validates a password
 * @param password The password to validate
 * @returns Error message or empty string if valid
 */
export const validatePassword = (password: string): string => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  
  return '';
};
