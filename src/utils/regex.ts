export const validateCIF = (cif: string) => {
  return cif.trim().length === 9;
};

export const validateTelefono = (telefono: string) => {
  // Solo números, exactamente 9
  const regex = /^[0-9]{9}$/;
  return regex.test(telefono.trim());
};

export const validateCP = (cp: string) => {
  // Solo números, exactamente 5
  const regex = /^[0-9]{5}$/;
  return regex.test(cp.trim());
};

export const validateEmail = (email: string) => {
  // Validación estándar de email
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

export const validatePassword = (password: string) => {
  /**
   * Mínimo 6 caracteres
   * Al menos una mayúscula (?=.*[A-Z])
   * Al menos una minúscula (?=.*[a-z])
   * Al menos un número (?=.*\d)
   * Al menos un carácter especial (?=.*[@$!%*?&])
   */
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  return regex.test(password);
};