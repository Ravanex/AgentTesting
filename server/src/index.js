import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 4000;

const YAHOO_FINANCE_URL =
  'https://query1.finance.yahoo.com/v7/finance/quote?symbols=ZC=F';

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

app.get('/api/corn-price', async (_req, res) => {
  try {
    const response = await fetch(YAHOO_FINANCE_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.status}`);
    }

    const data = await response.json();
    const [quote] = data?.quoteResponse?.result ?? [];

    if (!quote) {
      throw new Error('No corn futures data returned');
    }

    res.json({
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      currency: quote.currency,
      exchange: quote.fullExchangeName,
      previousClose: quote.regularMarketPreviousClose ?? null,
      timestamp: quote.regularMarketTime
        ? new Date(quote.regularMarketTime * 1000).toISOString()
        : new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching corn price', error);
    res.status(502).json({
      error: 'Unable to retrieve corn price at this time. Please try again later.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
