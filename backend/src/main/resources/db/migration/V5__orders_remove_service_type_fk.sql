-- V5: Remove direct service_type FK from orders (replaced by order_items)
-- totalAmount now server-computed from SUM(order_items.subtotal)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_service_type;
ALTER TABLE orders DROP COLUMN IF EXISTS service_type_id;
