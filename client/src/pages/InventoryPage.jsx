import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function InventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("updated_at");
  const [order, setOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsLoading(true);
      setError("");

      const query = new URLSearchParams({
        search: deferredSearch,
        category,
        sortBy,
        order
      });

      try {
        const response = await fetch(`/api/products?${query.toString()}`, {
          credentials: "include"
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load inventory.");
        }

        if (!cancelled) {
          setProducts(payload.products);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [category, deferredSearch, order, sortBy]);

  async function handleDelete(productId) {
    const shouldDelete = window.confirm("Delete this product from inventory?");
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to delete product.");
      }

      setProducts((current) => current.filter((item) => item.id !== productId));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <AppShell title="Inventory Registry" subtitle="Search, filter, and manage live stock records">
      <section className="panel-block inventory-toolbar">
        <div className="inventory-toolbar-fields">
          <label className="toolbar-field">
            <span>Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Product name or ID"
            />
          </label>

          <label className="toolbar-field">
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
            </select>
          </label>

          <label className="toolbar-field">
            <span>Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="updated_at">Updated</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="quantity">Quantity</option>
              <option value="category">Category</option>
            </select>
          </label>

          <label className="toolbar-field">
            <span>Order</span>
            <select value={order} onChange={(event) => setOrder(event.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </label>
        </div>

        {user?.role === "admin" ? (
          <Link to="/inventory/new" className="toolbar-link-button">
            <span className="material-symbols-outlined">add_box</span>
            NEW_ENTRY
          </Link>
        ) : null}
      </section>

      {error ? <div className="auth-error inventory-error">{error}</div> : null}

      <section className="panel-block inventory-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Product Manifest</h3>
            <p className="panel-copy">Live inventory registry with category-specific metadata.</p>
          </div>
        </div>

        {isLoading ? (
          <p className="empty-note">Loading inventory records...</p>
        ) : products.length === 0 ? (
          <p className="empty-note">No products match the current filters.</p>
        ) : (
          <div className="inventory-table-wrap">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Extra</th>
                  <th>Value</th>
                  {user?.role === "admin" ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      <span>ID {product.id}</span>
                    </td>
                    <td>
                      <span className={`category-chip category-chip-${product.category}`}>
                        {product.category}
                      </span>
                    </td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>
                      <span
                        className={`quantity-pill${
                          product.quantity <= product.lowStockThreshold ? " is-low" : ""
                        }`}
                      >
                        {product.quantity}
                      </span>
                    </td>
                    <td>{product.category === "electronics" ? `${product.warrantyMonths} mo` : product.size}</td>
                    <td>{formatCurrency(product.inventoryValue)}</td>
                    {user?.role === "admin" ? (
                      <td>
                        <button
                          type="button"
                          className="table-action danger-action"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default InventoryPage;
