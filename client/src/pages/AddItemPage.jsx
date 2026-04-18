import AppShell from "../components/AppShell";
import ProductForm from "../components/ProductForm";

function AddItemPage() {
  return (
    <AppShell title="New Entry">
      <section className="panel-block add-item-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Product Intake Form</h3>
            <p className="panel-copy">
              Register products across multiple categories and capture source pricing in the
              currency used at purchase. Inventory value is normalized to INR automatically.
            </p>
          </div>
        </div>

        <ProductForm />
      </section>
    </AppShell>
  );
}

export default AddItemPage;
