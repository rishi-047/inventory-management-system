import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialState = {
  name: "",
  category: "electronics",
  price: "",
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

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
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
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
          </select>
          <i className="material-symbols-outlined">category</i>
        </label>

        <label className="auth-input">
          <span>UNIT_PRICE</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => updateField("price", event.target.value)}
          />
          <i className="material-symbols-outlined">payments</i>
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
        ) : (
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
