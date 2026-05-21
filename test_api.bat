@echo off
setlocal enabledelayedexpansion
set BASE=http://localhost:8080
set PASS=Test@1234
set PASS_COUNT=0
set FAIL_COUNT=0
set TOTAL=0

:: ── Login helper: saves token to var ─────────────────────────────
:getToken
:: Usage: call :getToken email varname
set _EMAIL=%~1
set _VAR=%~2
for /f "delims=" %%C in ('curl.exe -s -c - -X POST %BASE%/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"%_EMAIL%\",\"password\":\"%PASS%\"}" --max-time 10 2^>^&1') do (
    echo %%C | findstr /i "ll_jwt" >nul && (
        for /f "tokens=7" %%T in ("%%C") do set %_VAR%=%%T
    )
)
goto :eof

:: ── Request tester ───────────────────────────────────────────────
:testReq
:: Usage: call :testReq METHOD PATH BODY TOKEN DESC EXPECTED_CODE
set _M=%~1
set _P=%~2
set _B=%~3
set _T=%~4
set _D=%~5
set _EXP=%~6
set /a TOTAL+=1

if "%_T%"=="" (
    for /f "tokens=*" %%R in ('curl.exe -s -o NUL -w "%%{http_code}" -X %_M% %BASE%%_P% -H "Content-Type: application/json" -d "%_B%" --max-time 10 2^>^&1') do set _CODE=%%R
) else (
    for /f "tokens=*" %%R in ('curl.exe -s -o NUL -w "%%{http_code}" -X %_M% %BASE%%_P% -H "Content-Type: application/json" -H "Cookie: ll_jwt=%_T%" -d "%_B%" --max-time 10 2^>^&1') do set _CODE=%%R
)

if "!_CODE!"=="%_EXP%" (
    echo [PASS] !_CODE! ^| %_D%
    set /a PASS_COUNT+=1
) else (
    echo [FAIL] expected=%_EXP% got=!_CODE! ^| %_D%
    set /a FAIL_COUNT+=1
)
goto :eof

echo.
echo ================================================
echo  Lather ^& Line - Full API Test Suite (curl.exe)
echo ================================================

:: ── Step 1: Get tokens for all 4 roles ───────────────────────────
echo.
echo [SETUP] Logging in as all 4 roles...

for /f "tokens=*" %%R in ('curl.exe -s -D - -X POST %BASE%/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin.test@ll.com\",\"password\":\"Test@1234\"}" --max-time 10 2^>^&1') do (
    echo %%R | findstr /i "set-cookie" >nul && (
        for /f "tokens=2 delims==;" %%V in ("%%R") do (
            echo %%R | findstr /i "ll_jwt" >nul && set ADMIN_TOK=%%V
        )
    )
)

for /f "tokens=*" %%R in ('curl.exe -s -D - -X POST %BASE%/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"manager.test@ll.com\",\"password\":\"Test@1234\"}" --max-time 10 2^>^&1') do (
    echo %%R | findstr /i "set-cookie" >nul && (
        for /f "tokens=2 delims==;" %%V in ("%%R") do (
            echo %%R | findstr /i "ll_jwt" >nul && set MGR_TOK=%%V
        )
    )
)

for /f "tokens=*" %%R in ('curl.exe -s -D - -X POST %BASE%/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"washer.test@ll.com\",\"password\":\"Test@1234\"}" --max-time 10 2^>^&1') do (
    echo %%R | findstr /i "set-cookie" >nul && (
        for /f "tokens=2 delims==;" %%V in ("%%R") do (
            echo %%R | findstr /i "ll_jwt" >nul && set WSHR_TOK=%%V
        )
    )
)

for /f "tokens=*" %%R in ('curl.exe -s -D - -X POST %BASE%/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"customer.test@ll.com\",\"password\":\"Test@1234\"}" --max-time 10 2^>^&1') do (
    echo %%R | findstr /i "set-cookie" >nul && (
        for /f "tokens=2 delims==;" %%V in ("%%R") do (
            echo %%R | findstr /i "ll_jwt" >nul && set CUST_TOK=%%V
        )
    )
)

echo   Admin  token: !ADMIN_TOK:~0,20!...
echo   Mgr    token: !MGR_TOK:~0,20!...
echo   Washer token: !WSHR_TOK:~0,20!...
echo   Cust   token: !CUST_TOK:~0,20!...

:: ── Step 2: Seed a service and get its ID ────────────────────────
echo.
echo [SETUP] Seeding service types...
curl.exe -s -X POST %BASE%/api/services -H "Content-Type: application/json" -H "Cookie: ll_jwt=!ADMIN_TOK!" -d "{\"name\":\"WashFold-test\",\"description\":\"test\",\"pricePerUnit\":15.0,\"turnaroundHours\":24,\"unit\":\"KG\",\"active\":true}" --max-time 10 >nul 2>&1
for /f "tokens=*" %%R in ('curl.exe -s %BASE%/api/services --max-time 10 2^>^&1') do set SVCS_RESP=%%R
echo   Services: !SVCS_RESP:~0,100!...

:: Extract first service id (simple: look for "id":N)
for /f "tokens=2 delims=:," %%I in ('echo !SVCS_RESP! ^| findstr /o "\"id\":"') do (
    if not defined SVC_ID set SVC_ID=%%I
)
set SVC_ID=!SVC_ID: =!
echo   Using serviceId=!SVC_ID!

:: ═══════════════════════════════════════════════════════════
echo.
echo ── GROUP 1: PUBLIC ENDPOINTS (no auth) ──
call :testReq GET /api/businesses {} "" "GET /api/businesses" 200
call :testReq GET /api/services {} "" "GET /api/services" 200
call :testReq POST /api/chat {\"message\":\"Hello\"} "" "POST /api/chat (chatbot)" 200

echo.
echo ── GROUP 2: AUTH - GET /api/auth/me ──
call :testReq GET /api/auth/me {} !CUST_TOK! "GET /auth/me (CUSTOMER)" 200
call :testReq GET /api/auth/me {} !ADMIN_TOK! "GET /auth/me (ADMIN)" 200
call :testReq GET /api/auth/me {} !MGR_TOK! "GET /auth/me (MANAGER)" 200
call :testReq GET /api/auth/me {} !WSHR_TOK! "GET /auth/me (WASHER)" 200
call :testReq GET /api/auth/me {} "" "GET /auth/me (no auth -> 403)" 403

echo.
echo ── GROUP 3: CUSTOMER ORDER ENDPOINTS ──
call :testReq GET /api/orders {} !CUST_TOK! "GET /orders (CUSTOMER)" 200
call :testReq GET "/api/orders/paged?page=0&size=10" {} !CUST_TOK! "GET /orders/paged (CUSTOMER)" 200
call :testReq GET /api/orders/all {} !CUST_TOK! "GET /orders/all (CUSTOMER -> 403)" 403
call :testReq GET /api/orders/active {} !CUST_TOK! "GET /orders/active (CUSTOMER -> 403)" 403

echo.
echo ── GROUP 4: STAFF ORDER ENDPOINTS ──
call :testReq GET /api/orders/all {} !ADMIN_TOK! "GET /orders/all (ADMIN)" 200
call :testReq GET "/api/orders/all/paged?page=0&size=5" {} !ADMIN_TOK! "GET /orders/all/paged (ADMIN)" 200
call :testReq GET /api/orders/active {} !ADMIN_TOK! "GET /orders/active (ADMIN)" 200
call :testReq GET /api/orders/all {} !MGR_TOK! "GET /orders/all (MANAGER)" 200
call :testReq GET /api/orders/all {} !WSHR_TOK! "GET /orders/all (WASHER)" 200
call :testReq GET /api/orders/active {} !WSHR_TOK! "GET /orders/active (WASHER)" 200
call :testReq POST /api/orders {\"items\":[]} !ADMIN_TOK! "POST /orders (ADMIN -> 403)" 403
call :testReq POST /api/orders {\"items\":[]} !WSHR_TOK! "POST /orders (WASHER -> 403)" 403
call :testReq POST /api/orders {\"items\":[]} !MGR_TOK! "POST /orders (MANAGER -> 403)" 403

echo.
echo ── GROUP 5: SERVICES CRUD ──
call :testReq GET /api/services/all {} !ADMIN_TOK! "GET /services/all (ADMIN)" 200
call :testReq GET /api/services/all {} !MGR_TOK! "GET /services/all (MANAGER)" 200
call :testReq GET /api/services/all {} !WSHR_TOK! "GET /services/all (WASHER -> 403)" 403
call :testReq GET /api/services/all {} !CUST_TOK! "GET /services/all (CUSTOMER -> 403)" 403
call :testReq POST /api/services {\"name\":\"HackSvc\"} !MGR_TOK! "POST /services (MANAGER -> 403)" 403
call :testReq POST /api/services {\"name\":\"HackSvc\"} !WSHR_TOK! "POST /services (WASHER -> 403)" 403
call :testReq POST /api/services {\"name\":\"HackSvc\"} !CUST_TOK! "POST /services (CUSTOMER -> 403)" 403

echo.
echo ── GROUP 6: POS ORDER + STATUS FLOW ──
for /f "tokens=*" %%R in ('curl.exe -s -X POST %BASE%/api/orders/pos -H "Content-Type: application/json" -H "Cookie: ll_jwt=!ADMIN_TOK!" -d "{\"customerPhone\":\"9777777777\",\"customerName\":\"Walk-in\",\"items\":[{\"serviceTypeId\":!SVC_ID!,\"quantity\":3}]}" --max-time 10 2^>^&1') do set POS_RESP=%%R

echo   POS response: !POS_RESP:~0,120!

:: Check if 201 was returned - extract publicId
echo !POS_RESP! | findstr "publicId" >nul && (
    echo [PASS] 201 ^| POST /api/orders/pos (ADMIN)
    set /a PASS_COUNT+=1
) || (
    echo [FAIL] POST /api/orders/pos (ADMIN) - no publicId in response
    set /a FAIL_COUNT+=1
)
set /a TOTAL+=1

:: Extract publicId - look for "publicId":"UUID"
for /f "tokens=2 delims=:" %%P in ('echo !POS_RESP! ^| findstr /o "publicId"') do (
    if not defined ORDER_ID set ORDER_ID=%%P
)
set ORDER_ID=!ORDER_ID:"=!
set ORDER_ID=!ORDER_ID:,=!
set ORDER_ID=!ORDER_ID: =!
:: Clean up - take just 36 chars (UUID length)
set ORDER_ID=!ORDER_ID:~0,36!
echo   Order publicId: !ORDER_ID!

call :testReq POST /api/orders/pos {\"customerPhone\":\"9888888888\",\"customerName\":\"x\",\"items\":[]} !CUST_TOK! "POST /orders/pos (CUSTOMER -> 403)" 403

if not "!ORDER_ID!"=="" (
    call :testReq GET /api/orders/!ORDER_ID! {} !ADMIN_TOK! "GET /orders/{id} (ADMIN)" 200
    call :testReq GET /api/orders/!ORDER_ID! {} !WSHR_TOK! "GET /orders/{id} (WASHER)" 200
    call :testReq GET /api/orders/!ORDER_ID! {} !CUST_TOK! "GET /orders/{id} (CUST not owner -> 403)" 403
    call :testReq PATCH /api/orders/!ORDER_ID!/status {\"orderStatus\":\"PICKED_UP\"}   !WSHR_TOK! "PATCH PENDING->PICKED_UP (WASHER)" 200
    call :testReq PATCH /api/orders/!ORDER_ID!/status {\"orderStatus\":\"IN_PROGRESS\"} !WSHR_TOK! "PATCH PICKED_UP->IN_PROGRESS (WASHER)" 200
    call :testReq PATCH /api/orders/!ORDER_ID!/status {\"orderStatus\":\"READY\"}       !WSHR_TOK! "PATCH IN_PROGRESS->READY (WASHER)" 200
    call :testReq PATCH /api/orders/!ORDER_ID!/status {\"orderStatus\":\"DELIVERED\"}   !ADMIN_TOK! "PATCH READY->DELIVERED (ADMIN)" 200
    call :testReq PATCH /api/orders/!ORDER_ID!/status {\"orderStatus\":\"PENDING\"}     !CUST_TOK! "PATCH status (CUSTOMER -> 403)" 403
)

echo.
echo ── GROUP 7: NO AUTH - must all return 403 ──
call :testReq GET /api/orders {} "" "GET /orders (no auth -> 403)" 403
call :testReq GET /api/orders/all {} "" "GET /orders/all (no auth -> 403)" 403
call :testReq GET /api/orders/active {} "" "GET /orders/active (no auth -> 403)" 403
call :testReq POST /api/orders {\"items\":[]} "" "POST /orders (no auth -> 403)" 403
call :testReq GET /api/services/all {} "" "GET /services/all (no auth -> 403)" 403
call :testReq POST /api/services {\"name\":\"x\"} "" "POST /services (no auth -> 403)" 403
call :testReq PATCH /api/orders/00000000-0000-0000-0000-000000000001/status {\"orderStatus\":\"DELIVERED\"} "" "PATCH status (no auth -> 403)" 403

echo.
echo ================================================
echo  RESULTS: Total=!TOTAL!  PASS=!PASS_COUNT!  FAIL=!FAIL_COUNT!
echo ================================================
