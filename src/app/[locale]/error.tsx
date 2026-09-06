"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="panel">
      <h1>This view could not load</h1>
      <p>
        Your last submitted changes have not been assumed successful. Retry the
        view to check its current state.
      </p>
      <button className="button" onClick={reset}>
        Retry
      </button>
    </section>
  );
}
