function App() {
  return (
    <main className="boot-shell">
      <section className="boot-panel">
        <div className="boot-mark">OPS-CONTROL-V1</div>
        <h1>Industrial inventory system bootstrapped for web.</h1>
        <p>
          React, Express, and SQLite are wired as the app foundation. The next
          slices will replace this placeholder with the real Stitch-based login,
          dashboard, inventory, transactions, alerts, and admin user flows.
        </p>
        <div className="boot-grid">
          <article>
            <span>Frontend</span>
            <strong>React + Vite</strong>
          </article>
          <article>
            <span>Backend</span>
            <strong>Express API</strong>
          </article>
          <article>
            <span>Persistence</span>
            <strong>SQLite</strong>
          </article>
        </div>
      </section>
    </main>
  );
}

export default App;
