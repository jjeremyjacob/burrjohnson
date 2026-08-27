#!/bin/bash

cd "$(dirname "$0")"

echo ""
echo "========================================"
echo "       CLIENT GALLERY UPDATER"
echo "========================================"
echo ""

IMAGE_DIR="images"
OUTPUT="images.json"

echo "Scanning images folder..."
echo ""


# Create the JSON file
echo "[" > "$OUTPUT"

FIRST=true


# Find supported image files
find "$IMAGE_DIR" \
  -maxdepth 1 \
  -type f \
  \( \
    -iname "*.jpg" \
    -o -iname "*.jpeg" \
    -o -iname "*.png" \
    -o -iname "*.webp" \
    -o -iname "*.gif" \
    -o -iname "*.avif" \
  \) \
  -print0 |
sort -z -V |
while IFS= read -r -d '' FILE
do

    FILENAME="$(basename "$FILE")"

    if [ "$FIRST" = true ]; then
        FIRST=false
    else
        echo "," >> "$OUTPUT"
    fi

    printf '  "%s"' "$FILENAME" >> "$OUTPUT"

done


echo "" >> "$OUTPUT"
echo "]" >> "$OUTPUT"


# Count images
COUNT=$(find "$IMAGE_DIR" \
  -maxdepth 1 \
  -type f \
  \( \
    -iname "*.jpg" \
    -o -iname "*.jpeg" \
    -o -iname "*.png" \
    -o -iname "*.webp" \
    -o -iname "*.gif" \
    -o -iname "*.avif" \
  \) \
  | wc -l)


echo ""
echo "========================================"
echo ""
echo "        $COUNT IMAGES FOUND"
echo ""
echo "        images.json UPDATED"
echo ""
echo "========================================"
echo ""
echo "You can now close this window."
echo ""

read -n 1 -s