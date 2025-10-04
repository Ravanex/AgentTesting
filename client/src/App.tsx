import { useEffect, useState } from 'react';

type HealthResponse = {
  status: string;
  message: string;
};

type CornPriceResponse = {
  symbol: string;
  price: number;
  currency: string;
  exchange: string;
  previousClose: number | null;
  timestamp: string;
};

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(value);

const formatTimestamp = (timestamp: string) =>
  new Date(timestamp).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [cornPrice, setCornPrice] = useState<CornPriceResponse | null>(null);
  const [cornError, setCornError] = useState<string | null>(null);
  const [isCornLoading, setIsCornLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/health')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data: HealthResponse = await response.json();
        setHealth(data);
        setHealthError(null);
      })
      .catch((err: Error) => {
        setHealthError(err.message);
      });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCornPrice = async (showLoader: boolean) => {
      if (showLoader) {
        setIsCornLoading(true);
      }

      try {
        const response = await fetch('/api/corn-price');
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: CornPriceResponse = await response.json();
        if (!isMounted) {
          return;
        }
        setCornPrice(data);
        setCornError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setCornError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        if (showLoader && isMounted) {
          setIsCornLoading(false);
        }
      }
    };

    loadCornPrice(true);
    const intervalId = window.setInterval(() => loadCornPrice(false), 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const priceChange =
    cornPrice && cornPrice.previousClose != null
      ? cornPrice.price - cornPrice.previousClose
      : null;
  const priceChangePercent =
    priceChange != null && cornPrice?.previousClose
      ? (priceChange / cornPrice.previousClose) * 100
      : null;

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: '2rem',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)'
      }}
    >
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: '#1f2937' }}>
        Live Corn Futures Monitor
      </h1>
      <p
        style={{
          fontSize: '1.1rem',
          color: '#4b5563',
          maxWidth: '36rem',
          textAlign: 'center'
        }}
      >
        Keep tabs on the latest Chicago Board of Trade corn futures price. The data updates
        automatically every few seconds so you always have the freshest quote.
      </p>

      <section
        style={{
          marginTop: '2rem',
          padding: '1.75rem 2.25rem',
          borderRadius: '1rem',
          backgroundColor: '#fff',
          boxShadow: '0 20px 25px -15px rgba(15, 23, 42, 0.3)',
          maxWidth: '32rem',
          width: '100%'
        }}
      >
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', color: '#2563eb' }}>
          CBOT Corn Futures (ZC=F)
        </h2>
        {isCornLoading ? (
          <p style={{ color: '#6b7280' }}>Fetching the latest price...</p>
        ) : cornError ? (
          <p style={{ color: '#dc2626', fontWeight: 600 }}>Error: {cornError}</p>
        ) : cornPrice ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '2.25rem', fontWeight: 700, color: '#111827' }}>
              {formatCurrency(cornPrice.price, cornPrice.currency)}
            </p>
            {priceChange != null && priceChangePercent != null ? (
              <p
                style={{
                  fontWeight: 600,
                  color: priceChange >= 0 ? '#16a34a' : '#dc2626'
                }}
              >
                {priceChange >= 0 ? '▲' : '▼'} {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </p>
            ) : null}
            <p style={{ color: '#4b5563' }}>
              Exchange: {cornPrice.exchange} • Last updated at {formatTimestamp(cornPrice.timestamp)}
            </p>
          </div>
        ) : (
          <p style={{ color: '#6b7280' }}>No price data available.</p>
        )}
      </section>

      <section
        style={{
          marginTop: '1.5rem',
          padding: '1.5rem 2rem',
          borderRadius: '1rem',
          backgroundColor: '#fff',
          boxShadow: '0 20px 25px -15px rgba(15, 23, 42, 0.2)',
          maxWidth: '32rem',
          width: '100%'
        }}
      >
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', color: '#2563eb' }}>
          Backend status
        </h2>
        {health ? (
          <p style={{ color: '#16a34a', fontWeight: 600 }}>
            {health.status.toUpperCase()}: {health.message}
          </p>
        ) : healthError ? (
          <p style={{ color: '#dc2626', fontWeight: 600 }}>Error: {healthError}</p>
        ) : (
          <p style={{ color: '#6b7280' }}>Checking backend health...</p>
        )}
      </section>
    </main>
  );
}

export default App;
