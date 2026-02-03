use axum::{
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
};
use crate::x402::get_payment_required_header;

/// Middleware to check for x402 payment proof
pub async fn x402_middleware<B>(
    req: Request<B>,
    next: Next<B>,
) -> Result<Response, StatusCode> {
    // 1. Check if the request is for a protected route (e.g., /reveal/:id)
    let path = req.uri().path();
    
    if path.starts_with("/reveal/") {
        // 2. Check for the Payment Proof header
        if let Some(proof) = req.headers().get("X-402-Payment-Proof") {
            // TODO: In a real implementation:
            // - Extract the signature
            // - Call x402_verifier.verify_payment()
            // - If valid, proceed
            let proof_str = proof.to_str().unwrap_or("");
            if !proof_str.is_empty() {
                return Ok(next.run(req).await);
            }
        }

        // 3. If no proof or invalid proof, return 402 Payment Required
        // In a real app, we'd fetch the price from the market/signal ID
        let price = 50000; // 0.05 USDC
        let vault = "SIGNAL402_VAULT_ADDRESS";
        
        let response = Response::builder()
            .status(StatusCode::PAYMENT_REQUIRED)
            .header("X-402-Payment-Options", get_payment_required_header(price, vault))
            .body(axum::body::Body::from("Payment Required to Unlock Alpha"))
            .unwrap();
            
        return Ok(response);
    }

    // For all other routes, just proceed
    Ok(next.run(req).await)
}
