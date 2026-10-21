export const formatValue = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-';
  return Number(value).toFixed(decimals);
};

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '-';
  const defaultOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-IN', { ...defaultOptions, ...options });
};
