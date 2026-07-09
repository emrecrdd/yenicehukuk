export const formatCurrency = (amount, currency = 'TL') => {
  if (!amount && amount !== 0) return `0.00 ${currency}`;
  
  const formatted = Number(amount).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `${formatted} ${currency}`;
};

export const parseCurrency = (value) => {
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9,.]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

export const formatCurrencyShort = (amount, currency = 'TL') => {
  if (!amount && amount !== 0) return `0 ${currency}`;
  
  const absAmount = Math.abs(amount);
  let formatted;
  
  if (absAmount >= 1000000) {
    formatted = (amount / 1000000).toFixed(1) + 'M';
  } else if (absAmount >= 1000) {
    formatted = (amount / 1000).toFixed(1) + 'K';
  } else {
    formatted = amount.toString();
  }
  
  return `${formatted} ${currency}`;
};