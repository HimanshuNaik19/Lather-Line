-- Add Razorpay specific fields and payment method to orders table
ALTER TABLE orders ADD COLUMN razorpay_order_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN razorpay_payment_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN razorpay_signature VARCHAR(255);
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(20) NOT NULL DEFAULT 'PAY_LATER';

-- Optional: If keeping stripe_session_id is fine, we leave it. Otherwise we could drop it, but it's safer to keep for backward compatibility.
