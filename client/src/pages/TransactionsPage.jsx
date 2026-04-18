import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { formatCategoryLabel, formatCurrencyInr } from "../lib/constants";

function TransactionsPage() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantitySold, setQuantitySold] = useState("1");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadProducts() {
    const response = await fetch("/api/products?sortBy=name&order=asc", {
      credentials: "include"
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Unable to load products.");
    }

    setProducts(payload.products);
    if (!productId && payload.products.length > 0) {
      setProductId(String(payload.products[0].id));
    }
  }

  useEffect(() => {
    loadProducts().catch((requestError) => setError(requestError.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productId: Number(productId),
          quantitySold: Number(quantitySold)
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to complete sale.");
      }

      setSuccess(
        `Sold ${payload.sale.quantitySold} unit(s) of ${payload.sale.product.name} for ${formatCurrencyInr(payload.sale.totalAmount)}.`
      );
      setQuantitySold("1");
      await loadProducts();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedProduct = products.find((item) => String(item.id) === productId);

  return (
    <AppShell title="Transaction Terminal">
      <section className="dashboard-grid">
        <article className="panel-block add-item-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Sell Product</h3>
              <p className="panel-copy">Use this terminal for cashier and admin stock transactions.</p>
            </div>
          </div>

          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="auth-input">
                <span>PRODUCT</span>
                <select value={productId} onChange={(event) => setProductId(event.target.value)}>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.quantity} in stock)
                    </option>
                  ))}
                </select>
              </label>

              <label className="auth-input">
                <span>QUANTITY_SOLD</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantitySold}
                  onChange={(event) => setQuantitySold(event.target.value)}
                />
                <i className="material-symbols-outlined">shopping_cart_checkout</i>
              </label>
            </div>

            {selectedProduct ? (
              <div className="transaction-summary">
                <div>
                  <span>Unit price</span>
                  <strong>{formatCurrencyInr(selectedProduct.price)}</strong>
                </div>
                <div>
                  <span>Stock left now</span>
                  <strong>{selectedProduct.quantity}</strong>
                </div>
                <div>
                  <span>Total preview</span>
                  <strong>{formatCurrencyInr(selectedProduct.price * Number(quantitySold || 0))}</strong>
                </div>
              </div>
            ) : null}

            {error ? <div className="auth-error">{error}</div> : null}
            {success ? <div className="form-success">{success}</div> : null}

            <div className="product-form-actions">
              <button type="submit" className="auth-primary-button" disabled={isSubmitting || !productId}>
                <span className="material-symbols-outlined">point_of_sale</span>
                {isSubmitting ? "PROCESSING..." : "COMPLETE_SALE"}
              </button>
            </div>
          </form>
        </article>

        <article className="panel-block">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Available Stock Snapshot</h3>
              <p className="panel-copy">Current quantities after the latest successful sale.</p>
            </div>
          </div>

          <div className="manifest-list">
            {products.slice(0, 6).map((product) => (
              <div key={product.id} className="manifest-row">
                <div>
                  <strong>{product.name}</strong>
                  <span>{formatCategoryLabel(product.category)}</span>
                </div>
                <div className="manifest-qty">
                  <span>{product.quantity} in stock</span>
                  <small>{formatCurrencyInr(product.price)} each</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}

export default TransactionsPage;
