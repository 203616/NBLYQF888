CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openid TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  nickname TEXT DEFAULT '亮叶用户',
  avatar_url TEXT,
  is_verified INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'editor',
  status TEXT DEFAULT 'active',
  last_login_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  desc TEXT,
  img TEXT NOT NULL,
  link TEXT,
  sort INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS service_scenes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scene_id TEXT UNIQUE,
  title TEXT,
  desc TEXT,
  icon TEXT,
  path TEXT,
  sort INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS success_cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  result TEXT,
  desc TEXT,
  sort INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published'
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  rate TEXT,
  desc TEXT,
  amount TEXT,
  term TEXT,
  suitable TEXT,
  path TEXT,
  cover TEXT,
  compliance_note TEXT,
  source_name TEXT,
  source_url TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  sort INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS product_tags (
  product_id INTEGER NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (product_id, tag),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  category TEXT,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  cover TEXT,
  source TEXT,
  level TEXT,
  risk_level TEXT,
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exposures (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  report_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  status_color TEXT,
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exposure_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  contact TEXT,
  evidence TEXT,
  user_id INTEGER,
  status TEXT DEFAULT 'pending',
  admin_note TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS demands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  amount TEXT,
  period TEXT,
  contact TEXT,
  city TEXT,
  purpose TEXT,
  remark TEXT,
  tags TEXT,
  linked_application_no TEXT,
  status TEXT DEFAULT 'matching',
  progress INTEGER DEFAULT 0,
  assignee_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS clues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  title TEXT,
  price TEXT,
  location TEXT,
  province TEXT,
  city TEXT,
  district TEXT,
  dealer TEXT,
  contact TEXT,
  description TEXT,
  tags TEXT,
  source TEXT DEFAULT 'manual',
  external_id TEXT,
  raw_payload TEXT,
  verified_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'pending',
  assignee_id INTEGER,
  user_id INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS finance_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  product_id INTEGER,
  product_name TEXT,
  loan_amount TEXT,
  loan_term TEXT,
  contact TEXT,
  remark TEXT,
  status TEXT DEFAULT 'submitted',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS data_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  source_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  last_sync_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS public_data_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER,
  data_key TEXT NOT NULL,
  title TEXT,
  payload TEXT NOT NULL,
  source_url TEXT,
  fetched_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT,
  FOREIGN KEY (source_id) REFERENCES data_sources(id)
);

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  province TEXT NOT NULL,
  city TEXT,
  metric_key TEXT NOT NULL,
  metric_label TEXT NOT NULL,
  metric_value REAL DEFAULT 0,
  source_name TEXT,
  source_url TEXT,
  captured_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'system',
  status TEXT DEFAULT 'unread',
  link TEXT,
  recipient_phone TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  read_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS service_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT DEFAULT '智能客服咨询',
  status TEXT DEFAULT 'open',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS service_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES service_sessions(id)
);

CREATE TABLE IF NOT EXISTS intake_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_no TEXT UNIQUE NOT NULL,
  user_id INTEGER,
  product_type TEXT,
  product_name TEXT,
  product_id TEXT,
  status TEXT DEFAULT 'draft',
  progress INTEGER DEFAULT 0,
  payload TEXT NOT NULL,
  workflow TEXT,
  assignee TEXT,
  admin_note TEXT,
  submitted_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS intake_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL,
  application_no TEXT NOT NULL,
  doc_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  ocr_payload TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (application_id) REFERENCES intake_applications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS intake_workflow_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL,
  application_no TEXT NOT NULL,
  stage TEXT NOT NULL,
  status TEXT NOT NULL,
  operator TEXT,
  remark TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (application_id) REFERENCES intake_applications(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_intake_app_no ON intake_applications(application_no);
CREATE INDEX IF NOT EXISTS idx_intake_status ON intake_applications(status);
CREATE INDEX IF NOT EXISTS idx_intake_docs_app ON intake_documents(application_id);

CREATE TABLE IF NOT EXISTS vehicle_valuations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT,
  brand TEXT,
  model TEXT,
  year INTEGER,
  register_city TEXT,
  vin TEXT,
  purchase_price REAL,
  mileage REAL,
  estimate REAL,
  photos TEXT,
  payload TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS warranty_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT,
  plan_id TEXT,
  vehicle_info TEXT,
  insurance_info TEXT,
  owner_info TEXT,
  status TEXT DEFAULT 'draft',
  payload TEXT,
  contract_no TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS warranty_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER,
  phone TEXT,
  plate_no TEXT,
  fault_desc TEXT,
  fault_photos TEXT,
  location TEXT,
  status TEXT DEFAULT 'submitted',
  handler TEXT,
  remark TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sales_staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  region TEXT DEFAULT '宁波市',
  department TEXT DEFAULT '延保业务部',
  role TEXT DEFAULT 'advisor',
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS finance_circle_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT,
  avatar TEXT,
  content TEXT,
  images TEXT,
  likes INTEGER DEFAULT 0,
  post_type TEXT DEFAULT 'feed',
  intake_product TEXT,
  intake_product_name TEXT,
  review_status TEXT DEFAULT 'approved',
  review_note TEXT,
  reviewed_at TEXT,
  author_phone TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS finance_circle_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_name TEXT,
  content TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
