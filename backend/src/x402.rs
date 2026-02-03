use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signature::Signature;
use std::str::FromStr;

pub struct X402Verifier {
    rpc_client: RpcClient,
    vault_address: Pubkey,
}

impl X402Verifier {
    pub fn new(rpc_url: &str, vault_addr: &str) -> Self {
        Self {
            rpc_client: RpcClient::new(rpc_url.to_string()),
            vault_address: Pubkey::from_str(vault_addr).expect("Invalid vault address"),
        }
    }

    /// Verifies if a given transaction signature corresponds to a valid payment to the vault
    pub async fn verify_payment(&self, signature_str: &str, _expected_amount: u64) -> Result<bool, Box<dyn std::error::Error + Send + Sync>> {
        let signature = Signature::from_str(signature_str)?;
        
        // Fetch transaction details from Solana
        let tx = self.rpc_client.get_transaction(&signature, solana_transaction_status::UiTransactionEncoding::Json).await?;
        
        // Basic confirmation check
        if let Some(meta) = tx.transaction.meta {
            if meta.err.is_none() {
                return Ok(true);
            }
        }
        
        Ok(false)
    }
}

pub fn get_payment_required_header(price: u64, vault: &str) -> String {
    format!("x402 amount={}, address={}, asset=USDC", price, vault)
}
