CREATE TABLE businesses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(255),
    address_text VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    phone VARCHAR(15),
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_business FOREIGN KEY (business_id) REFERENCES businesses(id),
    CONSTRAINT uk_business_email UNIQUE (business_id, email)
);

CREATE TABLE service_types (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    description VARCHAR(500),
    turnaround_hours INT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_service_types_business FOREIGN KEY (business_id) REFERENCES businesses(id),
    CONSTRAINT uk_business_service_name UNIQUE (business_id, name)
);

CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pin_code VARCHAR(10) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_addresses_business FOREIGN KEY (business_id) REFERENCES businesses(id),
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    business_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    service_type_id BIGINT NOT NULL,
    address_id BIGINT NOT NULL,
    pickup_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    order_status VARCHAR(20) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    special_instructions VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_orders_business FOREIGN KEY (business_id) REFERENCES businesses(id),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_orders_service_type FOREIGN KEY (service_type_id) REFERENCES service_types(id),
    CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses(id)
);
