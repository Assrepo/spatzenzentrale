#!/bin/bash

# Build alle Plugin-Frontends

PLUGINS=("BotBucket" "Dashboard" "News" "DatabaseViewer" "QR-Proxy")

for plugin in "${PLUGINS[@]}"; do
  echo "=== Building $plugin ==="
  cd "/home/user/spatzenzentrale/api/plugins/$plugin/frontend"

  if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
  fi

  echo "Building..."
  npm run build

  if [ $? -eq 0 ]; then
    echo "✅ $plugin built successfully"
  else
    echo "❌ $plugin build failed"
  fi

  echo ""
done

echo "=== All plugins built ==="
