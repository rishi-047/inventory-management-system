import AppShell from "../components/AppShell";
import ProductForm from "../components/ProductForm";

function AddItemPage() {
  return (
    <AppShell title="New Entry" subtitle="Register a new product into the live inventory">
      <section className="panel-block add-item-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Product Intake Form</h3>
            <p className="panel-copy">
              Use electronics for warranty-backed equipment and clothing for size-based apparel stock.
            </p>
          </div>
        </div>

        <ProductForm />
      </section>
    </AppShell>
  );
}

export default AddItemPage;
