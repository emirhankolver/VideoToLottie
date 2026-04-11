#!/bin/bash

set -e

# -----------------------------
# Usage check
# -----------------------------
if [ -z "$1" ]; then
  echo "Usage: ./video-to-lottie.sh input.mov [output.json]"
  exit 1
fi

INPUT="$1"
OUTPUT="${2:-output.json}"

# -----------------------------
# Setup
# -----------------------------
BASENAME=$(basename "$INPUT" | sed 's/\.[^.]*$//')
WORKDIR="./tmp_$BASENAME"

FRAMES_DIR="$WORKDIR/frames"
WEBP_DIR="$WORKDIR/webp"

mkdir -p "$FRAMES_DIR"
mkdir -p "$WEBP_DIR"

echo "🚀 Processing: $INPUT"

# -----------------------------
# Step 1: Extract ALL frames (PNG with alpha)
# -----------------------------
echo "🎞 Extracting frames..."

ffmpeg -i "$INPUT" \
-vsync 0 \
-vf "scale=512:512:force_original_aspect_ratio=decrease,\
pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,\
format=rgba" \
"$FRAMES_DIR/frame_%04d.png"

# -----------------------------
# Step 2: Convert PNG → WebP
# -----------------------------
echo "🧩 Converting to WebP..."

for file in "$FRAMES_DIR"/*.png; do
  filename=$(basename "$file" .png)
  cwebp -q 75 -alpha_q 70 "$file" -o "$WEBP_DIR/$filename.webp"
done

# -----------------------------
# Step 3: Generate Lottie JSON
# -----------------------------
echo "🧠 Generating Lottie JSON..."

node index.js "$WEBP_DIR" "$OUTPUT"

# -----------------------------
# Done
# -----------------------------
echo "✅ Done! Output: $OUTPUT"

# Optional cleanup
# rm -rf "$WORKDIR"
