-- Add Cryptomus to payment providers
ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'cryptomus';

-- Payments table for tracking individual payment transactions
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  telegram_id BIGINT, -- For users without auth
  provider payment_provider NOT NULL DEFAULT 'cryptomus',
  provider_payment_id TEXT UNIQUE, -- Cryptomus UUID
  order_id TEXT UNIQUE NOT NULL,
  tier subscription_tier NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_url TEXT,
  paid_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_telegram_id ON payments(telegram_id);
CREATE INDEX idx_payments_status ON payments(status);

-- RLS for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for webhooks)
CREATE POLICY "Service role full access" ON payments
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id OR telegram_id IN (
    SELECT telegram_id FROM profiles WHERE id = auth.uid()
  ));

-- Trigger for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
