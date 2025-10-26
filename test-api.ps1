# API Testing Script for Country Currency Exchange API
$baseUrl = "http://localhost:3000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Country Currency Exchange API - Test Suite" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Test 1: Health Check (GET /)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method Get
    Write-Host "✓ Success" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

Write-Host "`n----------------------------------------`n" -ForegroundColor Gray

Write-Host "Test 2: Refresh Country Data (POST /countries/refresh)" -ForegroundColor Yellow
Write-Host "Note: This may take 30-60 seconds..." -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/countries/refresh" -Method Post
    Write-Host "✓ Success" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

Write-Host "`n----------------------------------------`n" -ForegroundColor Gray

Write-Host "Test 3: Get All Countries (GET /countries)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/countries" -Method Get
    Write-Host "✓ Success - Retrieved $($response.Count) countries" -ForegroundColor Green
    Write-Host "First 3 countries:" -ForegroundColor Gray
    $response[0..2] | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

Write-Host "`n----------------------------------------`n" -ForegroundColor Gray

Write-Host "Test 4: Filter by Region (GET /countries?region=Africa)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/countries?region=Africa" -Method Get
    Write-Host "✓ Success - Found $($response.Count) African countries" -ForegroundColor Green
    Write-Host "First 2 African countries:" -ForegroundColor Gray
    $response[0..1] | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

Write-Host "`n----------------------------------------`n" -ForegroundColor Gray

Write-Host "Test 5: Sort by GDP (GET /countries?sort=gdp_desc)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/countries?sort=gdp_desc" -Method Get
    Write-Host "✓ Success - Top 3 countries by GDP:" -ForegroundColor Green
    $response[0..2] | Select-Object name, estimated_gdp, currency_code | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

Write-Host "`n----------------------------------------`n" -ForegroundColor Gray

Write-Host "Test 6: Get Single Country (GET /countries/Nigeria)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/countries/Nigeria" -Method Get
    Write-Host "✓ Success" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

Write-Host "`n----------------------------------------`n" -ForegroundColor Gray

Write-Host "Test 7: Get API Status (GET /status)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/status" -Method Get
    Write-Host "✓ Success" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

Write-Host "`n----------------------------------------`n" -ForegroundColor Gray

Write-Host "Test 8: Get Summary Image (GET /countries/image)" -ForegroundColor Yellow
try {
    $outputPath = ".\summary_test.png"
    Invoke-WebRequest -Uri "$baseUrl/countries/image" -OutFile $outputPath
    Write-Host "✓ Success - Image saved to $outputPath" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

Write-Host "`n----------------------------------------`n" -ForegroundColor Gray

Write-Host "Test 9: Test 404 Error (GET /countries/NonExistentCountry)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/countries/NonExistentCountry" -Method Get
    Write-Host "✗ Should have returned 404" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "✓ Correctly returned 404" -ForegroundColor Green
    } else {
        Write-Host "✗ Wrong error code: $_" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Suite Completed!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
