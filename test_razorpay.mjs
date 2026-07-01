const PASS = 'Test@1234';
const BASE = 'http://localhost:8080';

async function login(email) {
  const r = await fetch(BASE + '/api/auth/login', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ email, password: PASS }) 
  });
  const cookie = r.headers.get('set-cookie') || '';
  const m = cookie.match(/ll_jwt=([^;]+)/);
  if (!m) throw new Error("Login failed");
  return m[1];
}

async function run() {
  try {
    console.log("Logging in as customer...");
    const token = await login('customer.test@ll.com');
    const headers = { 'Content-Type': 'application/json', 'Cookie': 'll_jwt=' + token };
    
    console.log("Fetching orders...");
    const ordersReq = await fetch(BASE + '/api/orders', { headers });
    const orders = await ordersReq.json();
    if (orders.length === 0) { console.log('No orders to pay for.'); return; }
    
    // Find an unpaid online order or create one
    let order = orders.find(o => o.status === 'PENDING' && o.paymentStatus !== 'PAID');
    if (!order) {
        order = orders[0];
    }
    
    console.log('Testing Razorpay for Order:', order.publicId);
    console.log('Sending request to /api/payments/create/' + order.publicId);
    
    const createReq = await fetch(BASE + '/api/payments/create/' + order.publicId, { method: 'POST', headers });
    const createRes = await createReq.json();
    
    console.log('Create Payment Response:', createRes);
    if (createRes.razorpayOrderId && createRes.razorpayOrderId.startsWith('order_')) {
        console.log("✅ Razorpay successfully generated an order ID using the provided keys!");
    } else {
        console.log("❌ Razorpay failed to generate a real order ID.");
    }
  } catch(e) {
    console.error("Error:", e);
  }
}
run();
