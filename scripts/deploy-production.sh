#!/bin/bash
#
# Deploy cityfinance-ng-ui-v2 in production.
#
# Run this ON THE SERVER (after you've already SSHed in), from inside the git
# checkout — e.g. /var/www/html/production-cicd/cityfinance-ng-ui-v2/repo:
#
#   cd /var/www/html/production-cicd/cityfinance-ng-ui-v2/repo
#   git pull
#   ./scripts/deploy-production.sh
#
# It pulls the target branch, builds, then puts the new build live via an
# atomic symlink flip so nginx never serves a half-written directory. Point
# nginx's root at <repo>/../current.

# Abort on any error, on use of an unset variable, or if any command in a pipe fails.
set -euo pipefail

BRANCH="${BRANCH:-main}"            # branch to deploy
KEEP_RELEASES="${KEEP_RELEASES:-5}" # how many old releases to retain, for rollback

# Resolve the repo root from this script's own location, so the script works
# no matter what directory it's invoked from.
# eg: /var/www/html/production-cicd/cityfinance-ng-ui-v2/repo
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Parent of the repo checkout — releases/ and the current symlink live beside it.
# eg: /var/www/html/production-cicd/cityfinance-ng-ui-v2
BASE_DIR="$(dirname "$REPO_DIR")"
RELEASES_DIR="$BASE_DIR/releases"    # eg: .../cityfinance-ng-ui-v2/releases — holds one timestamped folder per build
LIVE_LINK="$BASE_DIR/current"        # eg: .../cityfinance-ng-ui-v2/current — symlink nginx's root points at
RELEASE_NAME="$(date +%Y%m%d%H%M%S)" # eg: 20260901143205 — unique id for this build
RELEASE_PATH="$RELEASES_DIR/$RELEASE_NAME" # eg: .../cityfinance-ng-ui-v2/releases/20260901143205

echo "Deploying branch '$BRANCH' from $REPO_DIR"

# Update the working copy to the exact state of the remote branch.
cd "$REPO_DIR"
git fetch --all
git reset --hard "origin/$BRANCH"

# Install dependencies exactly as locked, then produce the production build.
npm ci
npm run build

# Move the fresh build out of the repo and into its own timestamped release
# folder, so past releases stay available for rollback.
mkdir -p "$RELEASES_DIR"
mv "$REPO_DIR/dist/cityfinance-ng-ui-v2/browser" "$RELEASE_PATH"

# Flip the live symlink to the new release atomically: create it under a temp
# name first, then rename over the old symlink in one filesystem operation so
# nginx is never briefly pointed at a symlink that doesn't exist yet.
ln -sfn "$RELEASE_PATH" "$LIVE_LINK.tmp"
mv -Tf "$LIVE_LINK.tmp" "$LIVE_LINK"

# Prune old releases, keeping only the newest $KEEP_RELEASES (newest-first
# listing, skip the first $KEEP_RELEASES entries, delete the rest).
cd "$RELEASES_DIR"
ls -1t | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf

echo "Release $RELEASE_NAME is now live at $LIVE_LINK"
