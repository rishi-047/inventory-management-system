export const PRODUCT_CATEGORIES = [
  "electronics",
  "clothing",
  "stationery",
  "accessories",
  "furniture",
  "appliances"
];

export const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"];

export const CURRENCY_RATES = {
  INR: 1,
  USD: 83.1,
  EUR: 90.4,
  GBP: 106.2,
  AED: 22.63
};

export function formatCurrencyInr(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);
}

export function formatCategoryLabel(category) {
  if (!category) {
    return "Unknown";
  }

  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function categoryTone(category) {
  return `category-chip-${category || "default"}`;
}
