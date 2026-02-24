# Remove Next.js cache (close any running 'bun dev' first)
if (Test-Path .next) {
  Remove-Item -Recurse -Force .next
  Write-Host "Cleared .next cache"
}

# Start dev server
Write-Host "Starting dev server..."
bun dev
