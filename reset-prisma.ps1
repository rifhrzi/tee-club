Write-Host "Stopping any Node.js processes..." -ForegroundColor Cyan
taskkill /F /IM node.exe

Write-Host "Cleaning up Prisma files..." -ForegroundColor Cyan
# Try to remove the problematic directories
try {
    if (Test-Path -Path "node_modules\.prisma") {
        Remove-Item -Recurse -Force -Path "node_modules\.prisma" -ErrorAction SilentlyContinue
    }
    if (Test-Path -Path "node_modules\@prisma") {
        Remove-Item -Recurse -Force -Path "node_modules\@prisma" -ErrorAction SilentlyContinue
    }
    if (Test-Path -Path "node_modules\.cache") {
        Remove-Item -Recurse -Force -Path "node_modules\.cache" -ErrorAction SilentlyContinue
    }
} catch {
    Write-Host "Some files could not be removed. This is okay, we'll continue." -ForegroundColor Yellow
}

Write-Host "Cleaning npm cache..." -ForegroundColor Cyan
npm cache clean --force

Write-Host "Reinstalling dependencies..." -ForegroundColor Cyan
npm install

Write-Host "Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate

Write-Host "Running database migrations..." -ForegroundColor Cyan
npx prisma migrate dev --name init

Write-Host "Seeding the database..." -ForegroundColor Cyan
npm run seed

Write-Host "Process completed!" -ForegroundColor Green
