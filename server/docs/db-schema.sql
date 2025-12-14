-- =====================
-- ENUM TYPES
-- =====================
CREATE TYPE user_role AS ENUM (
  'USER',
  'SELLER',
  'ADMIN'
);

CREATE TYPE order_status AS ENUM (
  'PENDING',
  'PAID',
  'SHIPPED',
  'DONE',
  'CANCELLED'
);

-- =====================
-- USERS
-- =====================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- =====================
-- BOOKS
-- =====================
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  isbn VARCHAR(255) UNIQUE,
  description TEXT,
  cover_image_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- =====================
-- CARTS
-- =====================
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  CONSTRAINT fk_carts_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- =====================
-- CART ITEMS
-- =====================
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),

  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id)
    REFERENCES carts(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_cart_items_book
    FOREIGN KEY (book_id)
    REFERENCES books(id)
);

-- =====================
-- ORDERS
-- =====================
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  status order_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
);

-- =====================
-- ORDER ITEMS
-- =====================
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL,

  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_order_items_book
    FOREIGN KEY (book_id)
    REFERENCES books(id)
);

-- =====================
-- REVIEWS
-- =====================
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_reviews_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_reviews_book
    FOREIGN KEY (book_id)
    REFERENCES books(id)
    ON DELETE CASCADE
);

-- =====================
-- FAVORITES
-- =====================
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,

  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_favorites_book
    FOREIGN KEY (book_id)
    REFERENCES books(id)
    ON DELETE CASCADE,

  CONSTRAINT uq_favorites_user_book UNIQUE (user_id, book_id)
);

-- =====================
-- REFRESH TOKENS
-- =====================
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id
  ON refresh_tokens(user_id);
