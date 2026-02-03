mod agent;
mod market;
mod x402;
mod types;
mod service;

use axum::{
    routing::{get, post},
    Json, Router, extract::State,
};
use crate::types::{Signal, MarketPlatform};
use crate::service::SignalService;
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use chrono::Utc;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt::init();
    dotenvy::dotenv().ok();
    let service = Arc::new(SignalService::new());

    // Define routes
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/signals", get(get_signals))
        .route("/reveal/{id}", post(reveal_alpha))
        .layer(CorsLayer::permissive())
        .with_state(service);

    // Run the server
    let addr = SocketAddr::from(([127, 0, 0, 1], 4000));
    tracing::info!("Signal402 Backend listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> &'static str {
    "Signal402 AI Engine: Online"
}

async fn get_signals(
    State(service): State<Arc<SignalService>>,
) -> Json<Vec<Signal>> {
    match service.refresh_signals().await {
        Ok(signals) => Json(signals),
        Err(e) => {
            tracing::error!("Failed to fetch signals: {}", e);
            Json(vec![])
        }
    }
}

async fn reveal_alpha(
    axum::extract::Path(id): axum::extract::Path<String>,
) -> Json<serde_json::Value> {
    // This will eventually handle the x402 verification logic
    Json(serde_json::json!({
        "status": "payment_required",
        "protocol": "x402",
        "signal_id": id,
        "message": "Send 0.05 USDC to the designated vault to unlock CIO-grade reasoning."
    }))
}
