
$base = "http://localhost:8080"
$pass = "Test@1234"
$results = @()

function getToken([string]$email) {
    $body = (@{email=$email; password=$pass} | ConvertTo-Json)
    $resp = Invoke-WebRequest -Uri "$base/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    $sc = $resp.Headers["Set-Cookie"]
    if ($sc -is [array]) { $sc = $sc[0] }
    if ($sc -match "ll_jwt=([^;]+)") { return $Matches[1] }
    return $null
}

function req([string]$method, [string]$path, $body=$null, [string]$tok="", [string]$desc="", [int]$exp=200) {
    $uri = "$base$path"
    $hdrs = @{}
    if ($tok) { $hdrs["Cookie"] = "ll_jwt=$tok" }
    try {
        $p = @{ Method=$method; Uri=$uri; Headers=$hdrs; ErrorAction="Stop" }
        if ($body) { $p.Body = ($body | ConvertTo-Json -Depth 5); $p.ContentType = "application/json" }
        $r = Invoke-RestMethod @p
        $ok = $exp -lt 300
        $script:results += [PSCustomObject]@{ N=($script:results.Count+1); R=if($ok){"✅"}else{"❌"}; Exp=$exp; Got="2xx"; Desc=$desc }
        return $r
    } catch {
        $code = [int]$_.Exception.Response.StatusCode.value__
        $ok = $code -eq $exp
        $script:results += [PSCustomObject]@{ N=($script:results.Count+1); R=if($ok){"✅"}else{"❌"}; Exp=$exp; Got=$code; Desc=$desc }
        return $null
    }
}

Write-Host "Acquiring JWT tokens for all 4 roles..."
$tA = getToken "admin.test@ll.com"
$tM = getToken "manager.test@ll.com"
$tW = getToken "washer.test@ll.com"
$tC = getToken "customer.test@ll.com"
Write-Host "  admin=$($tA -ne $null)  manager=$($tM -ne $null)  washer=$($tW -ne $null)  customer=$($tC -ne $null)"

# Seed services
Write-Host "`nSeeding services..."
req "POST" "/api/services" @{name="Wash and Fold";description="Basic wash";pricePerUnit=15.0;turnaroundHours=24;unit="KG";active=$true}   -tok $tA -desc "SEED" -exp 201 | Out-Null
req "POST" "/api/services" @{name="Dry Cleaning";description="Dry clean";pricePerUnit=50.0;turnaroundHours=48;unit="PIECE";active=$true} -tok $tA -desc "SEED" -exp 201 | Out-Null
req "POST" "/api/services" @{name="Ironing";description="Steam iron";pricePerUnit=10.0;turnaroundHours=12;unit="PIECE";active=$true}     -tok $tA -desc "SEED" -exp 201 | Out-Null
$results = @()  # reset - seeding doesn't count as tests

$svcs = Invoke-RestMethod -Uri "$base/api/services" -Method GET
$sId = ($svcs | Select-Object -First 1).id
Write-Host "  Services available: $($svcs.Count) | Using serviceId=$sId"

# ════════════════════════════════════════════════════════
Write-Host "`n[GROUP 1] PUBLIC endpoints (no authentication required)"
req "GET"  "/api/businesses"                              -desc "GET /api/businesses"       -exp 200
req "GET"  "/api/services"                                -desc "GET /api/services"         -exp 200
req "POST" "/api/chat" @{message="What are your prices?"} -desc "POST /api/chat"            -exp 200

# ════════════════════════════════════════════════════════
Write-Host "`n[GROUP 2] Auth - GET /api/auth/me (all roles)"
req "GET" "/api/auth/me" -tok $tC -desc "GET /auth/me (CUSTOMER)"    -exp 200
req "GET" "/api/auth/me" -tok $tA -desc "GET /auth/me (ADMIN)"       -exp 200
req "GET" "/api/auth/me" -tok $tM -desc "GET /auth/me (MANAGER)"     -exp 200
req "GET" "/api/auth/me" -tok $tW -desc "GET /auth/me (WASHER)"      -exp 200
req "GET" "/api/auth/me"           -desc "GET /auth/me (no auth->403)"-exp 403

# ════════════════════════════════════════════════════════
Write-Host "`n[GROUP 3] CUSTOMER order endpoints"
req "GET" "/api/orders"                      -tok $tC -desc "GET /orders (CUSTOMER)"         -exp 200
req "GET" "/api/orders/paged?page=0&size=10" -tok $tC -desc "GET /orders/paged (CUSTOMER)"   -exp 200
req "GET" "/api/orders/all"                  -tok $tC -desc "GET /orders/all (CUST->403)"    -exp 403
req "GET" "/api/orders/active"               -tok $tC -desc "GET /orders/active (CUST->403)" -exp 403

# ════════════════════════════════════════════════════════
Write-Host "`n[GROUP 4] STAFF order endpoints"
req "GET" "/api/orders/all"                     -tok $tA -desc "GET /orders/all (ADMIN)"          -exp 200
req "GET" "/api/orders/all/paged?page=0&size=5" -tok $tA -desc "GET /orders/all/paged (ADMIN)"    -exp 200
req "GET" "/api/orders/active"                  -tok $tA -desc "GET /orders/active (ADMIN)"       -exp 200
req "GET" "/api/orders/all"                     -tok $tM -desc "GET /orders/all (MANAGER)"        -exp 200
req "GET" "/api/orders/all"                     -tok $tW -desc "GET /orders/all (WASHER)"         -exp 200
req "GET" "/api/orders/active"                  -tok $tW -desc "GET /orders/active (WASHER)"      -exp 200
req "POST" "/api/orders" @{items=@(@{serviceTypeId=$sId;quantity=1})} -tok $tA -desc "POST /orders (ADMIN->403)"   -exp 403
req "POST" "/api/orders" @{items=@(@{serviceTypeId=$sId;quantity=1})} -tok $tW -desc "POST /orders (WASHER->403)"  -exp 403
req "POST" "/api/orders" @{items=@(@{serviceTypeId=$sId;quantity=1})} -tok $tM -desc "POST /orders (MANAGER->403)" -exp 403

# ════════════════════════════════════════════════════════
Write-Host "`n[GROUP 5] SERVICE CRUD"
req "GET" "/api/services/all"   -tok $tA -desc "GET /services/all (ADMIN)"       -exp 200
req "GET" "/api/services/all"   -tok $tM -desc "GET /services/all (MANAGER)"     -exp 200
req "GET" "/api/services/all"   -tok $tW -desc "GET /services/all (WASHER->403)" -exp 403
req "GET" "/api/services/all"   -tok $tC -desc "GET /services/all (CUST->403)"   -exp 403

$ns = req "POST" "/api/services" @{name="TmpSvc";description="Tmp";pricePerUnit=5.0;turnaroundHours=1;unit="KG";active=$true} -tok $tA -desc "POST /services (ADMIN)" -exp 201
req "POST" "/api/services" @{name="Hack"} -tok $tM -desc "POST /services (MGR->403)"  -exp 403
req "POST" "/api/services" @{name="Hack"} -tok $tW -desc "POST /services (WSHR->403)" -exp 403
req "POST" "/api/services" @{name="Hack"} -tok $tC -desc "POST /services (CUST->403)" -exp 403

if ($ns -and $ns.id) {
    $nid = $ns.id
    req "PUT"    "/api/services/$nid" @{name="TmpSvcUpd";pricePerUnit=6.0;turnaroundHours=2;unit="KG";active=$true} -tok $tA -desc "PUT /services/{id} (ADMIN)"       -exp 200
    req "PUT"    "/api/services/$nid" @{name="x";pricePerUnit=1.0;turnaroundHours=1;unit="KG";active=$true}          -tok $tM -desc "PUT /services/{id} (MGR->403)"    -exp 403
    req "DELETE" "/api/services/$nid" -tok $tW -desc "DELETE /services/{id} (WSHR->403)" -exp 403
    req "DELETE" "/api/services/$nid" -tok $tA -desc "DELETE /services/{id} (ADMIN)"     -exp 204
}

# ════════════════════════════════════════════════════════
Write-Host "`n[GROUP 6] POS ORDER + full WASHER status flow"
$pos = req "POST" "/api/orders/pos" @{customerPhone="9555555555";customerName="Walk-in Joe";specialInstructions="Test";items=@(@{serviceTypeId=$sId;quantity=2.5})} -tok $tA -desc "POST /orders/pos (ADMIN)" -exp 201
req "POST" "/api/orders/pos" @{customerPhone="9666666666";customerName="x";items=@(@{serviceTypeId=$sId;quantity=1})} -tok $tC -desc "POST /orders/pos (CUST->403)" -exp 403

if ($pos -and $pos.publicId) {
    $pid = $pos.publicId
    Write-Host "  Order: $pid | status=$($pos.orderStatus) | total=Rs.$($pos.totalAmount)"

    req "GET"   "/api/orders/$pid" -tok $tA -desc "GET /orders/{id} (ADMIN)"               -exp 200
    req "GET"   "/api/orders/$pid" -tok $tW -desc "GET /orders/{id} (WASHER)"              -exp 200
    req "GET"   "/api/orders/$pid" -tok $tC -desc "GET /orders/{id} (CUST not owner->403)" -exp 403

    req "PATCH" "/api/orders/$pid/status" @{orderStatus="PICKED_UP"}   -tok $tW -desc "PATCH PENDING->PICKED_UP (WASHER)"    -exp 200
    req "PATCH" "/api/orders/$pid/status" @{orderStatus="IN_PROGRESS"} -tok $tW -desc "PATCH PICKED_UP->IN_PROGRESS (WASHER)"-exp 200
    req "PATCH" "/api/orders/$pid/status" @{orderStatus="READY"}       -tok $tW -desc "PATCH IN_PROGRESS->READY (WASHER)"    -exp 200
    req "PATCH" "/api/orders/$pid/status" @{orderStatus="DELIVERED"}   -tok $tA -desc "PATCH READY->DELIVERED (ADMIN)"       -exp 200
    req "PATCH" "/api/orders/$pid/status" @{orderStatus="PENDING"}     -tok $tC -desc "PATCH status (CUST->403)"             -exp 403
}

# ════════════════════════════════════════════════════════
Write-Host "`n[GROUP 7] NO AUTH - all must return 403"
req "GET"   "/api/orders"              -desc "GET /orders (no auth)"       -exp 403
req "GET"   "/api/orders/all"          -desc "GET /orders/all (no auth)"   -exp 403
req "GET"   "/api/orders/active"       -desc "GET /orders/active (no auth)"-exp 403
req "POST"  "/api/orders" @{items=@()} -desc "POST /orders (no auth)"      -exp 403
req "GET"   "/api/services/all"        -desc "GET /services/all (no auth)" -exp 403
req "POST"  "/api/services" @{name="x"}-desc "POST /services (no auth)"    -exp 403
req "PATCH" "/api/orders/00000000-0000-0000-0000-000000000001/status" @{orderStatus="DELIVERED"} -desc "PATCH status (no auth)" -exp 403

# ════════════════════════════════════════════════════════
Write-Host "`n==================== FINAL RESULTS ===================="
$results | Format-Table N, R, Exp, Got, Desc -AutoSize

$p = ($results | Where-Object { $_.R -eq "✅" }).Count
$f = ($results | Where-Object { $_.R -eq "❌" }).Count
Write-Host "  TOTAL: $($results.Count)  |  PASS: $p  |  FAIL: $f"
if ($f -gt 0) {
    Write-Host "`nFAILED TESTS:"
    $results | Where-Object { $_.R -eq "❌" } | Format-Table N, Exp, Got, Desc -AutoSize
}
Write-Host "======================================================="
