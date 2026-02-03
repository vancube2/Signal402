# Build Stage
FROM rust:1.80-slim as builder

WORKDIR /app
COPY . .

# Install dependencies for compilation
RUN apt-get update && apt-get install -y pkg-config libssl-dev

RUN cargo build --release

# Run Stage
FROM debian:bookworm-slim

WORKDIR /app
COPY --from=builder /app/target/release/backend /app/backend
COPY --from=builder /app/.env /app/.env

# Install SSL certs for API calls
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

EXPOSE 4000

CMD ["./backend"]
