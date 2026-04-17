import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "..", "data", "inventory.sqlite");

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'cashier')),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('electronics', 'clothing')),
    price REAL NOT NULL CHECK(price >= 0),
    quantity INTEGER NOT NULL CHECK(quantity >= 0),
    warranty_months INTEGER,
    size TEXT,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity_sold INTEGER NOT NULL CHECK(quantity_sold > 0),
    unit_price REAL NOT NULL CHECK(unit_price >= 0),
    total_amount REAL NOT NULL CHECK(total_amount >= 0),
    sold_by_user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (sold_by_user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_user_id INTEGER,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
  );
`);

const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
if (userCount === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (full_name, username, password_hash, role)
    VALUES (@fullName, @username, @passwordHash, @role)
  `);

  insertUser.run({
    fullName: "System Administrator",
    username: "admin",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "admin"
  });

  insertUser.run({
    fullName: "Operations Cashier",
    username: "cashier",
    passwordHash: bcrypt.hashSync("cash123", 10),
    role: "cashier"
  });
}

const productCount = db.prepare("SELECT COUNT(*) AS count FROM products").get().count;
if (productCount === 0) {
  const insertProduct = db.prepare(`
    INSERT INTO products (name, category, price, quantity, warranty_months, size, low_stock_threshold)
    VALUES (@name, @category, @price, @quantity, @warrantyMonths, @size, @lowStockThreshold)
  `);

  const seedProducts = [
    {
      name: "Warehouse Tablet",
      category: "electronics",
      price: 42999,
      quantity: 12,
      warrantyMonths: 24,
      size: null,
      lowStockThreshold: 4
    },
    {
      name: "Barcode Scanner",
      category: "electronics",
      price: 18999,
      quantity: 8,
      warrantyMonths: 18,
      size: null,
      lowStockThreshold: 3
    },
    {
      name: "Safety Jacket",
      category: "clothing",
      price: 1499,
      quantity: 18,
      warrantyMonths: null,
      size: "L",
      lowStockThreshold: 5
    },
    {
      name: "Shift Polo Shirt",
      category: "clothing",
      price: 899,
      quantity: 4,
      warrantyMonths: null,
      size: "M",
      lowStockThreshold: 5
    },
    {
      name: "Receipt Printer",
      category: "electronics",
      price: 10999,
      quantity: 2,
      warrantyMonths: 12,
      size: null,
      lowStockThreshold: 2
    }
  ];

  for (const product of seedProducts) {
    insertProduct.run(product);
  }
}

export function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.full_name,
    username: user.username,
    role: user.role,
    isActive: Boolean(user.is_active),
    createdAt: user.created_at
  };
}

function normalizeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    quantity: product.quantity,
    warrantyMonths: product.warranty_months,
    size: product.size,
    lowStockThreshold: product.low_stock_threshold,
    inventoryValue: Number((product.price * product.quantity).toFixed(2)),
    createdAt: product.created_at,
    updatedAt: product.updated_at
  };
}

function validateProductInput(input, mode = "create") {
  const requiredFields = ["name", "category", "price", "quantity"];
  if (mode === "create") {
    for (const field of requiredFields) {
      if (input[field] === undefined || input[field] === null || input[field] === "") {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  if (input.category && !["electronics", "clothing"].includes(input.category)) {
    throw new Error("Category must be either electronics or clothing.");
  }

  if (input.price !== undefined && Number(input.price) < 0) {
    throw new Error("Price must be non-negative.");
  }

  if (input.quantity !== undefined && Number(input.quantity) < 0) {
    throw new Error("Quantity must be non-negative.");
  }

  if (input.lowStockThreshold !== undefined && Number(input.lowStockThreshold) < 0) {
    throw new Error("Low stock threshold must be non-negative.");
  }

  const effectiveCategory = input.category;
  if (effectiveCategory === "electronics" && (input.warrantyMonths === undefined || input.warrantyMonths === null || input.warrantyMonths === "")) {
    throw new Error("Electronics products require warranty months.");
  }

  if (effectiveCategory === "clothing" && (!input.size || String(input.size).trim() === "")) {
    throw new Error("Clothing products require a size.");
  }
}

export function logActivity(actorUserId, actionType, entityType, entityId, description) {
  db.prepare(`
    INSERT INTO activity_logs (actor_user_id, action_type, entity_type, entity_id, description)
    VALUES (?, ?, ?, ?, ?)
  `).run(actorUserId ?? null, actionType, entityType, entityId ?? null, description);
}

export function getUserByUsername(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
}

export function getUserById(id) {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  return sanitizeUser(user);
}

export function listUsers() {
  return db
    .prepare("SELECT * FROM users ORDER BY created_at DESC")
    .all()
    .map(sanitizeUser);
}

export function createUser({ fullName, username, password, role }, actorUserId) {
  if (!fullName || !username || !password || !role) {
    throw new Error("Full name, username, password, and role are required.");
  }

  if (!["admin", "cashier"].includes(role)) {
    throw new Error("Role must be admin or cashier.");
  }

  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (existing) {
    throw new Error("Username already exists.");
  }

  const result = db.prepare(`
    INSERT INTO users (full_name, username, password_hash, role)
    VALUES (?, ?, ?, ?)
  `).run(fullName.trim(), username.trim(), bcrypt.hashSync(password, 10), role);

  const createdUser = getUserById(result.lastInsertRowid);
  logActivity(actorUserId, "CREATE", "user", createdUser.id, `Created ${role} account for ${createdUser.username}.`);
  return createdUser;
}

export function updateUserStatus(userId, isActive, actorUserId) {
  const result = db.prepare(`
    UPDATE users
    SET is_active = ?
    WHERE id = ?
  `).run(isActive ? 1 : 0, userId);

  if (result.changes === 0) {
    throw new Error("User not found.");
  }

  const updatedUser = getUserById(userId);
  logActivity(actorUserId, "UPDATE", "user", updatedUser.id, `${updatedUser.username} was marked ${updatedUser.isActive ? "active" : "inactive"}.`);
  return updatedUser;
}

export function verifyPassword(password, passwordHash) {
  return bcrypt.compareSync(password, passwordHash);
}

export function listProducts({ search = "", category = "all", sortBy = "updated_at", order = "desc" } = {}) {
  const allowedSort = new Set(["updated_at", "created_at", "name", "price", "quantity", "category"]);
  const safeSort = allowedSort.has(sortBy) ? sortBy : "updated_at";
  const safeOrder = order === "asc" ? "ASC" : "DESC";

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push("(LOWER(name) LIKE ? OR CAST(id AS TEXT) LIKE ?)");
    const searchTerm = `%${search.toLowerCase()}%`;
    params.push(searchTerm, searchTerm);
  }

  if (category !== "all") {
    conditions.push("category = ?");
    params.push(category);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const statement = db.prepare(`
    SELECT *
    FROM products
    ${whereClause}
    ORDER BY ${safeSort} ${safeOrder}, id DESC
  `);

  return statement.all(...params).map(normalizeProduct);
}

export function getProductById(productId) {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(productId);
  return product ? normalizeProduct(product) : null;
}

export function createProduct(input, actorUserId) {
  validateProductInput(input, "create");

  const result = db.prepare(`
    INSERT INTO products (
      name, category, price, quantity, warranty_months, size, low_stock_threshold, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    input.name.trim(),
    input.category,
    Number(input.price),
    Number(input.quantity),
    input.category === "electronics" ? Number(input.warrantyMonths) : null,
    input.category === "clothing" ? input.size.trim() : null,
    Number(input.lowStockThreshold ?? 5)
  );

  const createdProduct = getProductById(result.lastInsertRowid);
  logActivity(actorUserId, "CREATE", "product", createdProduct.id, `Added product ${createdProduct.name}.`);
  return createdProduct;
}

export function updateProduct(productId, input, actorUserId) {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(productId);
  if (!existing) {
    throw new Error("Product not found.");
  }

  const merged = {
    name: input.name ?? existing.name,
    category: input.category ?? existing.category,
    price: input.price ?? existing.price,
    quantity: input.quantity ?? existing.quantity,
    warrantyMonths: input.warrantyMonths ?? existing.warranty_months,
    size: input.size ?? existing.size,
    lowStockThreshold: input.lowStockThreshold ?? existing.low_stock_threshold
  };

  validateProductInput(merged, "update");

  db.prepare(`
    UPDATE products
    SET
      name = ?,
      category = ?,
      price = ?,
      quantity = ?,
      warranty_months = ?,
      size = ?,
      low_stock_threshold = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    merged.name.trim(),
    merged.category,
    Number(merged.price),
    Number(merged.quantity),
    merged.category === "electronics" ? Number(merged.warrantyMonths) : null,
    merged.category === "clothing" ? merged.size.trim() : null,
    Number(merged.lowStockThreshold),
    productId
  );

  const updatedProduct = getProductById(productId);
  logActivity(actorUserId, "UPDATE", "product", updatedProduct.id, `Updated product ${updatedProduct.name}.`);
  return updatedProduct;
}

export function deleteProduct(productId, actorUserId) {
  const product = getProductById(productId);
  if (!product) {
    throw new Error("Product not found.");
  }

  db.prepare("DELETE FROM products WHERE id = ?").run(productId);
  logActivity(actorUserId, "DELETE", "product", product.id, `Deleted product ${product.name}.`);
  return product;
}

export function sellProduct(productId, quantitySold, actorUserId) {
  const executeSale = db.transaction(() => {
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(productId);
    if (!product) {
      throw new Error("Product not found.");
    }

    const quantity = Number(quantitySold);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Quantity sold must be a positive integer.");
    }

    if (product.quantity < quantity) {
      throw new Error("Insufficient stock for this sale.");
    }

    db.prepare(`
      UPDATE products
      SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(quantity, productId);

    const totalAmount = Number((product.price * quantity).toFixed(2));
    const saleResult = db.prepare(`
      INSERT INTO sales (product_id, quantity_sold, unit_price, total_amount, sold_by_user_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(productId, quantity, product.price, totalAmount, actorUserId);

    logActivity(actorUserId, "SALE", "sale", saleResult.lastInsertRowid, `Sold ${quantity} unit(s) of ${product.name}.`);

    return {
      saleId: saleResult.lastInsertRowid,
      product: getProductById(productId),
      quantitySold: quantity,
      totalAmount
    };
  });

  return executeSale();
}

export function getLowStockProducts() {
  return db
    .prepare(`
      SELECT *
      FROM products
      WHERE quantity <= low_stock_threshold
      ORDER BY quantity ASC, updated_at DESC
    `)
    .all()
    .map(normalizeProduct);
}

export function listActivity(limit = 12) {
  return db.prepare(`
    SELECT
      activity_logs.id,
      activity_logs.action_type,
      activity_logs.entity_type,
      activity_logs.entity_id,
      activity_logs.description,
      activity_logs.created_at,
      users.full_name AS actor_name,
      users.username AS actor_username,
      users.role AS actor_role
    FROM activity_logs
    LEFT JOIN users ON users.id = activity_logs.actor_user_id
    ORDER BY activity_logs.created_at DESC, activity_logs.id DESC
    LIMIT ?
  `).all(limit).map((row) => ({
    id: row.id,
    actionType: row.action_type,
    entityType: row.entity_type,
    entityId: row.entity_id,
    description: row.description,
    createdAt: row.created_at,
    actorName: row.actor_name,
    actorUsername: row.actor_username,
    actorRole: row.actor_role
  }));
}

export function getDashboardData() {
  const summary = db.prepare(`
    SELECT
      COUNT(*) AS totalProducts,
      COALESCE(SUM(quantity), 0) AS totalUnits,
      COALESCE(SUM(price * quantity), 0) AS totalInventoryValue
    FROM products
  `).get();

  const lowStockCount = db.prepare(`
    SELECT COUNT(*) AS count
    FROM products
    WHERE quantity <= low_stock_threshold
  `).get().count;

  const categoryBreakdown = db.prepare(`
    SELECT
      category,
      COUNT(*) AS productCount,
      COALESCE(SUM(price * quantity), 0) AS inventoryValue
    FROM products
    GROUP BY category
    ORDER BY inventoryValue DESC
  `).all().map((row) => ({
    category: row.category,
    productCount: row.productCount,
    inventoryValue: Number(row.inventoryValue.toFixed(2))
  }));

  const topStockItems = db.prepare(`
    SELECT id, name, quantity, category
    FROM products
    ORDER BY quantity DESC, updated_at DESC
    LIMIT 5
  `).all();

  const salesOverview = db.prepare(`
    SELECT
      COUNT(*) AS totalSales,
      COALESCE(SUM(total_amount), 0) AS totalSalesValue
    FROM sales
  `).get();

  return {
    metrics: {
      totalProducts: summary.totalProducts,
      totalUnits: summary.totalUnits,
      totalInventoryValue: Number(summary.totalInventoryValue.toFixed(2)),
      lowStockCount,
      totalSales: salesOverview.totalSales,
      totalSalesValue: Number(salesOverview.totalSalesValue.toFixed(2))
    },
    categoryBreakdown,
    topStockItems,
    lowStockItems: getLowStockProducts().slice(0, 5),
    recentActivity: listActivity(8)
  };
}

export { db };
