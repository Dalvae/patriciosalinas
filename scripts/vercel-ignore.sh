#!/usr/bin/env bash
set -euo pipefail

# Vercel ignoreCommand semantics:
# - exit 0: ignore/cancel this deployment
# - exit 1: continue with the deployment
#
# Keep production deploys from master/main, but prevent preview builds from
# feature/debug branches so we do not burn Vercel build minutes accidentally.
branch="${VERCEL_GIT_COMMIT_REF:-}"

case "$branch" in
  master|main)
    exit 1
    ;;
  *)
    echo "Skipping Vercel deployment for branch: ${branch:-unknown}"
    exit 0
    ;;
esac
