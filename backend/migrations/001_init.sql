CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  price_pi BIGINT NOT NULL,
  images JSONB DEFAULT '[]',
  stock INTEGER DEFAULT 1,
  ai_meta JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  amount_pi BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CREATED',
  payment_id TEXT,
  txid TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE disputes (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  buyer_id INTEGER REFERENCES users(id),
  seller_id INTEGER REFERENCES users(id),
  evidence JSONB,
  decision JSONB,
  created_at TIMESTAMP DEFAULT now()
);
