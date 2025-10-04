import { useEffect, useState } from 'react';

type HealthResponse = {
  status: string;
  message: string;
};

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data: HealthResponse = await response.json();
        setHealth(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, []);

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: '2rem',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1f2937' }}>
        AgentTesting Starter
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#4b5563', maxWidth: '32rem', textAlign: 'center' }}>
        This project pairs a lightweight Express backend with a TypeScript + React frontend powered by
        Vite. Start both servers to see live data flowing from the API.
      </p>
      <section style={{ marginTop: '2rem', padding: '1.5rem 2rem', borderRadius: '1rem', backgroundColor: '#fff', boxShadow: '0 20px 25px -15px rgba(15, 23, 42, 0.3)' }}>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', color: '#2563eb' }}>Backend status</h2>
        {health ? (
          <p style={{ color: '#16a34a', fontWeight: 600 }}>
            {health.status.toUpperCase()}: {health.message}
          </p>
        ) : error ? (
          <p style={{ color: '#dc2626', fontWeight: 600 }}>Error: {error}</p>
        ) : (
          <p style={{ color: '#6b7280' }}>Checking backend health...</p>
        )}
      </section>
    </main>
  );
}

export default App;
