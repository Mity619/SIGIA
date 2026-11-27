// HU-01: la contraseña debe tener 8 o más caracteres (Firebase solo exige 6).
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_TOO_SHORT_MESSAGE = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;

export const isPasswordLongEnough = (password: string): boolean =>
  password.length >= PASSWORD_MIN_LENGTH;
