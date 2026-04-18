import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CURRENCIES,
  CURRENCY_RATES,
  PRODUCT_CATEGORIES,
  formatCategoryLabel,
  formatCurrencyInr
} from "../lib/constants";

const initialState = {
  name: "",
  category: "electronics",
  originalPrice: "",
  currencyCode: "INR",
  quantity: "",
  warrantyMonths: "12",
  size: "M",
  lowStockThreshold: "5"
};

function ProductForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const convertedPrice =
    Number(form.originalPrice || 0) * (CURRENCY_RATES[form.currencyCode] || CURRENCY_RATES.INR);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const payload = {
      name: form.name,
      category: form.category,
      originalPrice: Number(form.originalPrice),
      currencyCode: form.currencyCode,
      quantity: Number(form.quantity),
      lowStockThreshold: Number(form.lowStockThreshold),
      warrantyMonths: form.category === "electronics" ? Number(form.warrantyMonths) : undefined,
      size: form.category === "clothing" ? form.size : undefined
    };

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to create product.");
      }

      setSuccess(`${result.product.name} added to inventory.`);
      setForm(initialState);

      setTimeout(() => {
        navigate("/inventory");
      }, 700);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="auth-input">
          <span>PRODUCT_NAME</span>
          <input value={form.name} onChange={(event) => updateField("name", event.target.value)} />
          <i className="material-symbols-outlined">inventory_2</i>
        </label>

        <label className="auth-input">
          <span>CATEGORY</span>
          <select value={form.category} onChange={(event) => updateField("category", event.target.value)}>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {formatCategoryLabel(category)}
              </option>
            ))}
          </select>
          <i className="material-symbols-outlined">category</i>
        </label>

        <label className="auth-input">
          <span>UNIT_PRICE_SOURCE</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.originalPrice}
            onChange={(event) => updateField("originalPrice", event.target.value)}
          />
          <i className="material-symbols-outlined">payments</i>
        </label>

        <label className="auth-input">
          <span>CURRENCY_CODE</span>
          <select
            value={form.currencyCode}
            onChange={(event) => updateField("currencyCode", event.target.value)}
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <i className="material-symbols-outlined">currency_exchange</i>
        </label>

        <label className="auth-input">
          <span>QUANTITY</span>
          <input
            type="number"
            min="0"
            step="1"
            value={form.quantity}
            onChange={(event) => updateField("quantity", event.target.value)}
          />
          <i className="material-symbols-outlined">warehouse</i>
        </label>

        {form.category === "electronics" ? (
          <label className="auth-input">
            <span>WARRANTY_MONTHS</span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.warrantyMonths}
              onChange={(event) => updateField("warrantyMonths", event.target.value)}
            />
            <i className="material-symbols-outlined">verified</i>
          </label>
        ) : form.category === "clothing" ? (
          <label className="auth-input">
            <span>SIZE_CODE</span>
            <select value={form.size} onChange={(event) => updateField("size", event.target.value)}>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
            <i className="material-symbols-outlined">styler</i>
          </label>
        ) : (
          <div className="form-placeholder-card">
            <span>EXTRA_METADATA</span>
            <strong>{formatCategoryLabel(form.category)}</strong>
            <p>This category does not require additional inventory attributes at intake.</p>
          </div>
        )}

        <label className="auth-input">
          <span>LOW_STOCK_THRESHOLD</span>
          <input
            type="number"
            min="0"
            step="1"
            value={form.lowStockThreshold}
            onChange={(event) => updateField("lowStockThreshold", event.target.value)}
          />
          <i className="material-symbols-outlined">warning</i>
        </label>

        <div className="currency-preview">
          <span>INR_PREVIEW</span>
          <strong>{formatCurrencyInr(convertedPrice)}</strong>
          <p>
            Stored inventory value is normalized to INR from {form.currencyCode} on submission.
          </p>
        </div>
      </div>

      {error ? <div className="auth-error">{error}</div> : null}
      {success ? <div className="form-success">{success}</div> : null}

      <div className="product-form-actions">
        <button type="submit" className="auth-primary-button" disabled={isSubmitting}>
          <span className="material-symbols-outlined">add_box</span>
          {isSubmitting ? "REGISTERING..." : "REGISTER_PRODUCT"}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
