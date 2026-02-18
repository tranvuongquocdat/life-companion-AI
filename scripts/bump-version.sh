#!/usr/bin/env bash
# Usage: ./scripts/bump-version.sh [patch|minor|major|x.y.z]
# Default: patch

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MANIFEST="$ROOT/manifest.json"
CURRENT=$(sed -n 's/.*"version": "\([^"]*\)".*/\1/p' "$MANIFEST" | head -1)

IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

case "${1:-patch}" in
  patch) PATCH=$((PATCH + 1)) ; NEW="$MAJOR.$MINOR.$PATCH" ;;
  minor) MINOR=$((MINOR + 1)) ; PATCH=0 ; NEW="$MAJOR.$MINOR.$PATCH" ;;
  major) MAJOR=$((MAJOR + 1)) ; MINOR=0 ; PATCH=0 ; NEW="$MAJOR.$MINOR.$PATCH" ;;
  *) NEW="$1" ;;
esac

echo "$CURRENT → $NEW"

# Update all 5 files
for f in "$MANIFEST" "$ROOT/package.json" "$ROOT/packages/core/package.json" "$ROOT/packages/server/package.json"; do
  sed -i '' "s/\"version\": \"$CURRENT\"/\"version\": \"$NEW\"/" "$f"
done

# Add entry to versions.json
sed -i '' "s/\"$CURRENT\": \"1.0.0\"/\"$CURRENT\": \"1.0.0\",\n  \"$NEW\": \"1.0.0\"/" "$ROOT/versions.json"

echo "Updated 5 files to v$NEW"