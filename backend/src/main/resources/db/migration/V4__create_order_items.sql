-- V4: Create order_items table for itemized 1:N order model
CREATE TABLE order_items (
    id             BIGSERIAL PRIMARY KEY,
    order_id       BIGINT          NOT NULL,
    service_type_id BIGINT         NOT NULL,
    quantity       DECIMAL(10, 3)  NOT NULL,   -- kg (e.g. 2.500) or pieces (e.g. 3.000)
    unit_price     DECIMAL(10, 2)  NOT NULL,   -- price snapshot at order time
    subtotal       DECIMAL(10, 2)  NOT NULL,   -- quantity * unit_price (server-computed)
    label          VARCHAR(100),               -- optional garment label e.g. "Shirt", "Pants"
    CONSTRAINT fk_items_order        FOREIGN KEY (order_id)        REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_items_service_type FOREIGN KEY (service_type_id) REFERENCES service_types(id)
);
