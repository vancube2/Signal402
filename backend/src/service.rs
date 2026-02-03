use crate::agent::GeminiAgent;
use crate::market::MarketFetcher;
use crate::x402::X402Verifier;
use crate::types::{Signal, MarketPlatform};
use chrono::Utc;
use std::env;

pub struct SignalService {
    pub agent: GeminiAgent,
    pub fetcher: MarketFetcher,
    pub verifier: X402Verifier,
}

impl SignalService {
    pub fn new() -> Self {
        let rpc_url = env::var("SOLANA_RPC_URL").unwrap_or_else(|_| "https://api.devnet.solana.com".to_string());
        let vault_addr = env::var("NEXT_PUBLIC_VAULT_ADDRESS").unwrap_or_else(|_| "6M2N...".to_string()); // Placeholder
        
        Self {
            agent: GeminiAgent::new(),
            fetcher: MarketFetcher::new(),
            verifier: X402Verifier::new(&rpc_url, &vault_addr),
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
