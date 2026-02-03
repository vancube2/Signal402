use crate::agent::GeminiAgent;
use crate::market::MarketFetcher;
use crate::types::{Signal, MarketPlatform};
use chrono::Utc;

pub struct SignalService {
    agent: GeminiAgent,
    fetcher: MarketFetcher,
}

impl SignalService {
    pub fn new() -> Self {
        Self {
            agent: GeminiAgent::new(),
            fetcher: MarketFetcher::new(),
        }
    }

    pub async fn refresh_signals(&self) -> Result<Vec<Signal>, Box<dyn std::error::Error + Send + Sync>> {
        let mut signals = Vec::new();

        // 1. Fetch live market observations
        let poly_markets = self.fetcher.fetch_polymarket_trending().await?;
        let kalshi_markets = self.fetcher.fetch_kalshi_trending().await?;

        // 2. Process each market through the AI analyst
        for market in poly_markets.into_iter().chain(kalshi_markets.into_iter()) {
            let alpha = self.agent.analyze_market(&format!("{:?}", market)).await?;
            
            signals.push(Signal {
                id: uuid::Uuid::new_v4().to_string(),
                market_id: market.external_id,
                platform: if market.platform == "Polymarket" { MarketPlatform::Polymarket } else { MarketPlatform::Kalshi },
                title: market.market_name,
                win_probability: alpha.win_probability,
                alpha_analysis: alpha.alpha_reasoning,
                micropayment_price: 50000, // Fixed 0.05 USDC for now
                created_at: Utc::now(),
                is_locked: true,
            });
        }

        Ok(signals)
    }
}
