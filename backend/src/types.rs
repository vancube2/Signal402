use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum MarketPlatform {
    Polymarket,
    Kalshi,
    Solflare,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Signal {
    pub id: String,
    pub market_id: String,
    pub platform: MarketPlatform,
    pub title: String,
    pub win_probability: f32,
    pub alpha_analysis: String,
    pub micropayment_price: u64,
    pub created_at: DateTime<Utc>,
    pub is_locked: bool,
    pub community_up: u32,
    pub community_down: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MarketObservation {
    pub platform: String,
    pub market_name: String,
    pub volume: f64,
    pub current_odds: f32,
    pub external_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MarketAlpha {
    pub win_probability: f32,
    pub alpha_reasoning: String,
    pub tail_risks: Vec<String>,
}
