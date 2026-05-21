const BASE = "http://localhost:8080";
const PASS = "Test@1234";
const results = [];

// ── Helpers ──────────────────────────────────────────────────────────────
async function login(email) {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASS }),
  });
  const cookie = r.headers.get("set-cookie") || "";
  const m = cookie.match(/ll_jwt=([^;]+)/);
  if (!m) { console.log(`  ⚠️  Login failed for ${email}: HTTP ${r.status}`); return null; }
  return m[1];
}

async function req(method, path, body, token, desc, exp = 200) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Cookie"] = `ll_jwt=${token}`;
  try {
    const r = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const ok = exp < 300 ? r.ok : r.status === exp;
    const got = r.status;
    results.push({ pass: ok, exp, got, desc });
    console.log(`  ${ok ? "✅" : "❌"} [${r.status}] ${desc}`);
    if (ok && exp < 300) return r.json().catch(() => null);
    return null;
  } catch (e) {
    results.push({ pass: false, exp, got: "ERR", desc });
    console.log(`  ❌ [ERR] ${desc}: ${e.message}`);
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────
(async () => {
  console.log("\n🔐 Acquiring tokens for all 4 roles...");
  const tA = await login("admin.test@ll.com");
  const tM = await login("manager.test@ll.com");
  const tW = await login("washer.test@ll.com");
  const tC = await login("customer.test@ll.com");
  console.log(`  admin=${!!tA}  manager=${!!tM}  washer=${!!tW}  customer=${!!tC}`);

  // Seed a service
  console.log("\n🌱 Seeding service types...");
  const s1 = await req("POST", "/api/services",
    { name: "Wash & Fold", description: "Basic", pricePerUnit: 15, turnaroundHours: 24, unit: "KG", active: true },
    tA, "SEED Wash&Fold", 201);
  const s2 = await req("POST", "/api/services",
    { name: "Dry Cleaning", description: "Dry clean", pricePerUnit: 50, turnaroundHours: 48, unit: "PIECE", active: true },
    tA, "SEED DryClean", 201);
  results.length = 0; // reset — seeds don't count as test cases

  const svcs = await (await fetch(`${BASE}/api/services`)).json();
  const svcId = svcs[0]?.id ?? s1?.id ?? 1;
  console.log(`  ${svcs.length} services available. Using serviceTypeId=${svcId}\n`);

  // ─────────────────────────────────────────────────────────────────────
  console.log("══ GROUP 1: PUBLIC ENDPOINTS (no auth) ══");
  await req("GET",  "/api/businesses", null, null, "GET /api/businesses",   200);
  await req("GET",  "/api/services",   null, null, "GET /api/services",     200);
  await req("POST", "/api/chat", { message: "What are your prices?" }, null, "POST /api/chat (chatbot)", 200);

  // ─────────────────────────────────────────────────────────────────────
  console.log("\n══ GROUP 2: AUTH - /api/auth/me ══");
  await req("GET", "/api/auth/me", null, tC, "GET /auth/me (CUSTOMER)",     200);
  await req("GET", "/api/auth/me", null, tA, "GET /auth/me (ADMIN)",        200);
  await req("GET", "/api/auth/me", null, tM, "GET /auth/me (MANAGER)",      200);
  await req("GET", "/api/auth/me", null, tW, "GET /auth/me (WASHER)",       200);
  await req("GET", "/api/auth/me", null, null, "GET /auth/me (no auth→403)",403);

  // ─────────────────────────────────────────────────────────────────────
  console.log("\n══ GROUP 3: CUSTOMER ORDER ENDPOINTS ══");
  await req("GET", "/api/orders",                     null, tC, "GET /orders (CUSTOMER)",          200);
  await req("GET", "/api/orders/paged?page=0&size=10",null, tC, "GET /orders/paged (CUSTOMER)",    200);
  await req("GET", "/api/orders/all",                 null, tC, "GET /orders/all (CUSTOMER→403)",  403);
  await req("GET", "/api/orders/active",              null, tC, "GET /orders/active (CUST→403)",   403);

  // ─────────────────────────────────────────────────────────────────────
  console.log("\n══ GROUP 4: STAFF ORDER ENDPOINTS ══");
  await req("GET", "/api/orders/all",                    null, tA, "GET /orders/all (ADMIN)",          200);
  await req("GET", "/api/orders/all/paged?page=0&size=5",null, tA, "GET /orders/all/paged (ADMIN)",   200);
  await req("GET", "/api/orders/active",                 null, tA, "GET /orders/active (ADMIN)",       200);
  await req("GET", "/api/orders/all",                    null, tM, "GET /orders/all (MANAGER)",        200);
  await req("GET", "/api/orders/all",                    null, tW, "GET /orders/all (WASHER)",         200);
  await req("GET", "/api/orders/active",                 null, tW, "GET /orders/active (WASHER)",      200);
  await req("POST","/api/orders", { items: [{ serviceTypeId: svcId, quantity: 1 }] }, tA, "POST /orders (ADMIN→403)",   403);
  await req("POST","/api/orders", { items: [{ serviceTypeId: svcId, quantity: 1 }] }, tW, "POST /orders (WASHER→403)",  403);
  await req("POST","/api/orders", { items: [{ serviceTypeId: svcId, quantity: 1 }] }, tM, "POST /orders (MANAGER→403)", 403);

  // ─────────────────────────────────────────────────────────────────────
  console.log("\n══ GROUP 5: SERVICES CRUD ══");
  await req("GET", "/api/services/all", null, tA, "GET /services/all (ADMIN)",       200);
  await req("GET", "/api/services/all", null, tM, "GET /services/all (MANAGER)",     200);
  await req("GET", "/api/services/all", null, tW, "GET /services/all (WASHER→403)",  403);
  await req("GET", "/api/services/all", null, tC, "GET /services/all (CUST→403)",    403);
  const ns = await req("POST", "/api/services",
    { name: "TmpTestSvc", description: "Tmp", pricePerUnit: 5, turnaroundHours: 1, unit: "KG", active: true },
    tA, "POST /services (ADMIN)", 201);
  await req("POST","/api/services", { name: "Hack" }, tM, "POST /services (MGR→403)",  403);
  await req("POST","/api/services", { name: "Hack" }, tW, "POST /services (WSHR→403)", 403);
  await req("POST","/api/services", { name: "Hack" }, tC, "POST /services (CUST→403)", 403);
  if (ns?.id) {
    await req("PUT",    `/api/services/${ns.id}`, { name: "TmpUpdated", pricePerUnit: 6, turnaroundHours: 2, unit: "KG", active: true }, tA, "PUT /services/{id} (ADMIN)", 200);
    await req("PUT",    `/api/services/${ns.id}`, { name: "Hack", pricePerUnit: 1, turnaroundHours: 1, unit: "KG", active: true }, tM, "PUT /services/{id} (MGR→403)",  403);
    await req("DELETE", `/api/services/${ns.id}`, null, tW, "DELETE /services/{id} (WSHR→403)", 403);
    await req("DELETE", `/api/services/${ns.id}`, null, tA, "DELETE /services/{id} (ADMIN)",    204);
  }

  // ─────────────────────────────────────────────────────────────────────
  console.log("\n══ GROUP 6: POS ORDER + FULL STATUS FLOW ══");
  const pos = await req("POST", "/api/orders/pos",
    { customerPhone: "9777777777", customerName: "Walk-in Joe", specialInstructions: "Automated test",
      items: [{ serviceTypeId: svcId, quantity: 3.5 }] },
    tA, "POST /orders/pos (ADMIN)", 201);
  await req("POST", "/api/orders/pos",
    { customerPhone: "9888888888", customerName: "x", items: [{ serviceTypeId: svcId, quantity: 1 }] },
    tC, "POST /orders/pos (CUST→403)", 403);

  if (pos?.publicId) {
    const pid = pos.publicId;
    console.log(`  📦 Order: ${pid} | status=${pos.orderStatus} | total=₹${pos.totalAmount}`);
    await req("GET",   `/api/orders/${pid}`, null, tA, "GET /orders/{id} (ADMIN)",           200);
    await req("GET",   `/api/orders/${pid}`, null, tW, "GET /orders/{id} (WASHER)",          200);
    await req("GET",   `/api/orders/${pid}`, null, tC, "GET /orders/{id} (CUST not owner→403)", 403);
    await req("PATCH", `/api/orders/${pid}/status`, { orderStatus: "PICKED_UP" },   tW, "PATCH PENDING→PICKED_UP (WASHER)",    200);
    await req("PATCH", `/api/orders/${pid}/status`, { orderStatus: "IN_PROGRESS" }, tW, "PATCH PICKED_UP→IN_PROGRESS (WASHER)", 200);
    await req("PATCH", `/api/orders/${pid}/status`, { orderStatus: "READY" },       tW, "PATCH IN_PROGRESS→READY (WASHER)",    200);
    await req("PATCH", `/api/orders/${pid}/status`, { orderStatus: "DELIVERED" },   tA, "PATCH READY→DELIVERED (ADMIN)",       200);
    await req("PATCH", `/api/orders/${pid}/status`, { orderStatus: "PENDING" },     tC, "PATCH status (CUST→403)",             403);
  }

  // ─────────────────────────────────────────────────────────────────────
  console.log("\n══ GROUP 7: NO AUTH - all must return 403 ══");
  await req("GET",   "/api/orders",              null, null, "GET /orders (no auth→403)",       403);
  await req("GET",   "/api/orders/all",          null, null, "GET /orders/all (no auth→403)",   403);
  await req("GET",   "/api/orders/active",       null, null, "GET /orders/active (no auth→403)",403);
  await req("POST",  "/api/orders", { items: [] },null, "POST /orders (no auth→403)",           403);
  await req("GET",   "/api/services/all",        null, null, "GET /services/all (no auth→403)", 403);
  await req("POST",  "/api/services", { name: "x" }, null, "POST /services (no auth→403)",     403);
  await req("PATCH", "/api/orders/00000000-0000-0000-0000-000000000001/status",
    { orderStatus: "DELIVERED" }, null, "PATCH status (no auth→403)",                          403);

  // ─────────────────────────────────────────────────────────────────────
  const pass = results.filter(r => r.pass).length;
  const fail = results.filter(r => !r.pass).length;
  console.log("\n" + "═".repeat(60));
  console.log(`  TOTAL: ${results.length}  |  ✅ PASS: ${pass}  |  ❌ FAIL: ${fail}`);
  console.log("═".repeat(60));
  if (fail > 0) {
    console.log("\nFAILED TESTS:");
    results.filter(r => !r.pass).forEach(r =>
      console.log(`  ❌ expected=${r.exp} got=${r.got} | ${r.desc}`)
    );
  }
})();
