// Verifies RBAC is working correctly for POST /api/orders
// The 3 failures in the main test were a test-script issue (invalid body → 400 before @PreAuthorize runs)
// This script sends a fully VALID body to confirm the 403 is returned correctly

const BASE = "http://localhost:8080";

async function login(email, password = "Test@1234") {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const cookie = r.headers.get("set-cookie") || "";
  const m = cookie.match(/ll_jwt=([^;]+)/);
  return m ? m[1] : null;
}

async function test(method, path, body, token, desc, expected) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Cookie"] = `ll_jwt=${token}`;
  const r = await fetch(`${BASE}${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const pass = r.status === expected;
  console.log(`  ${pass ? "✅" : "❌"} HTTP ${r.status} (expected ${expected}) | ${desc}`);
  return { pass, status: r.status };
}

(async () => {
  console.log("🔍 RBAC Verification — Confirming @PreAuthorize works with valid body\n");

  const tA = await login("admin.test@ll.com");
  const tM = await login("manager.test@ll.com");
  const tW = await login("washer.test@ll.com");
  console.log(`Tokens: admin=${!!tA}  manager=${!!tM}  washer=${!!tW}\n`);

  // A fully valid CreateRequest body matching the actual DTO
  // (uses street/city/state/pinCode — no addressId field)
  const validBody = {
    street: "123 Test Street",
    city: "Mumbai",
    state: "Maharashtra",
    pinCode: "400001",
    pickupTime: "2027-06-15T10:00:00",   // must be @Future
    items: [{ serviceTypeId: 2, quantity: 2.5 }],
    specialInstructions: "RBAC test"
  };

  console.log("Testing POST /api/orders with VALID body for non-CUSTOMER roles:");
  console.log("(If RBAC works → 403. If RBAC broken → 200/201)\n");

  const r1 = await test("POST", "/api/orders", validBody, tA, "POST /orders (ADMIN, valid body → must be 403)", 403);
  const r2 = await test("POST", "/api/orders", validBody, tM, "POST /orders (MANAGER, valid body → must be 403)", 403);
  const r3 = await test("POST", "/api/orders", validBody, tW, "POST /orders (WASHER, valid body → must be 403)", 403);

  console.log("\n--- Explanation of original test failures ---");
  console.log("The main test sent: { items: [{serviceTypeId, quantity}] }");
  console.log("Missing required fields: addressId, pickupTime");
  console.log("@Valid runs during argument resolution, BEFORE @PreAuthorize AOP kicks in.");
  console.log("Result: Spring returns 400 (validation fail) instead of 403 (auth fail).");
  console.log("This is a test-script limitation, NOT a real security gap.\n");

  const allPass = r1.pass && r2.pass && r3.pass;
  console.log(`\n${"═".repeat(50)}`);
  console.log(`  RBAC Check: ${allPass ? "✅ SECURE — all non-CUSTOMER roles correctly blocked" : "❌ BROKEN — fix @PreAuthorize"}`);
  console.log(`${"═".repeat(50)}`);
})();
