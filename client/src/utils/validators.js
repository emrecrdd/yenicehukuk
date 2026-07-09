export const validators = {
  required: (value) => {
    if (!value && value !== 0) return 'Bu alan gereklidir';
    return null;
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Geçerli bir e-posta giriniz';
    return null;
  },

  minLength: (min) => (value) => {
    if (!value) return null;
    if (value.length < min) return `En az ${min} karakter olmalıdır`;
    return null;
  },

  maxLength: (max) => (value) => {
    if (!value) return null;
    if (value.length > max) return `En fazla ${max} karakter olmalıdır`;
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Geçerli bir telefon numarası giriniz';
    }
    return null;
  },

  tcNumber: (value) => {
    if (!value) return null;
    const tcRegex = /^[1-9][0-9]{10}$/;
    if (!tcRegex.test(value)) return 'Geçerli bir TC kimlik numarası giriniz';
    return null;
  },

  number: (value) => {
    if (!value && value !== 0) return null;
    if (isNaN(Number(value))) return 'Sayısal bir değer giriniz';
    return null;
  },

  positiveNumber: (value) => {
    if (!value && value !== 0) return null;
    if (isNaN(Number(value))) return 'Sayısal bir değer giriniz';
    if (Number(value) < 0) return 'Pozitif bir sayı giriniz';
    return null;
  },
};

export const validate = (rules, values) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
    const value = values[field];
    
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  
  return errors;
};