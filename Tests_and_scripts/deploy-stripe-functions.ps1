# PowerShell script to deploy Stripe Edge Functions to Supabase

# 1. Set up environment variables
Write-Host "Setting up Supabase environment..." -ForegroundColor Green

# You need to set these environment variables first
# npx supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
# npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# 2. Deploy Edge Functions
Write-Host "Deploying Edge Functions..." -ForegroundColor Green

# Deploy stripe-checkout function
Write-Host "Deploying stripe-checkout..." -ForegroundColor Yellow
npx supabase functions deploy stripe-checkout

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ stripe-checkout deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy stripe-checkout" -ForegroundColor Red
    exit 1
}

# Deploy stripe-webhook function
Write-Host "Deploying stripe-webhook..." -ForegroundColor Yellow
npx supabase functions deploy stripe-webhook

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ stripe-webhook deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy stripe-webhook" -ForegroundColor Red
    exit 1
}

# Deploy manage-subscription function
Write-Host "Deploying manage-subscription..." -ForegroundColor Yellow
npx supabase functions deploy manage-subscription

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ manage-subscription deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy manage-subscription" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 All Edge Functions deployed successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Configure Stripe secrets: npx supabase secrets set STRIPE_SECRET_KEY=sk_test_..." -ForegroundColor White
Write-Host "2. Configure webhook secret: npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_..." -ForegroundColor White
Write-Host "3. Update database with Stripe price IDs" -ForegroundColor White
Write-Host "4. Test the payment flow" -ForegroundColor White
