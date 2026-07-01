-- Inventory Items
CREATE TABLE inventory_items (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quantity_in_stock DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    cost_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    low_stock_threshold DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Service Inventory Requirements mapping
CREATE TABLE service_inventory_requirements (
    id BIGSERIAL PRIMARY KEY,
    service_type_id BIGINT NOT NULL,
    inventory_item_id BIGINT NOT NULL,
    quantity_required DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_req_service FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE CASCADE,
    CONSTRAINT fk_req_inventory FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    UNIQUE(service_type_id, inventory_item_id)
);

-- Expenses
CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_expense_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Update orders to track COGS and prevent double deduction
ALTER TABLE orders ADD COLUMN inventory_deducted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN cogs DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
