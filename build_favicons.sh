#!/bin/bash
set -ex

# Create directory for favicon sizes if it doesn't exist
mkdir -p public/favicon

# Generate different sizes from original
sips -z 16 16 public/musemeter.png --out public/favicon/favicon-16x16.png
sips -z 32 32 public/musemeter.png --out public/favicon/favicon-32x32.png
sips -z 180 180 public/musemeter.png --out public/favicon/apple-touch-icon.png
sips -z 192 192 public/musemeter.png --out public/favicon/android-chrome-192x192.png
sips -z 512 512 public/musemeter.png --out public/favicon/android-chrome-512x512.png