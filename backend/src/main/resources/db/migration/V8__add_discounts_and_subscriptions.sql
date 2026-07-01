CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id),
    code VARCHAR(50) NOT NULL,
    discount_percentage DECIMAL(5,2) NOT NULL,
    max_discount DECIMAL(10,2),
    valid_until TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (business_id, code)
);

CREATE TABLE subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    included_kg INT NOT NULL DEFAULT 0,
    included_pieces INT NOT NULL DEFAULT 0,
    stripe_price_id VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    plan_id BIGINT NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    current_period_end TIMESTAMP NOT NULL,
    remaining_kg INT NOT NULL DEFAULT 0,
    remaining_pieces INT NOT NULL DEFAULT 0,
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE orders
    ADD COLUMN coupon_id BIGINT REFERENCES coupons(id);

ALTER TABLE orders
    ADD COLUMN subtotal_amount DECIMAL(10,2);

ALTER TABLE orders
    ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0.00;

-- Backfill subtotal_amount for existing orders to be equal to total_amount
UPDATE orders SET subtotal_amount = total_amount WHERE subtotal_amount IS NULL;
ALTER TABLE orders ALTER COLUMN subtotal_amount SET NOT NULL;
