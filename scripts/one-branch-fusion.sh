#!/usr/bin/env bash
set -euo pipefail

TARGET_BRANCH="${1:-main}"
REMOTE_NAME="${2:-origin}"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "❌ Not inside a Git repository."
  exit 1
fi

current_branch="$(git branch --show-current || true)"
if [[ -z "$current_branch" ]]; then
  echo "❌ Could not detect current branch."
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ Working tree is not clean. Commit or stash first."
  exit 1
fi

if git rev-parse --verify "$TARGET_BRANCH" >/dev/null 2>&1; then
  git checkout "$TARGET_BRANCH"
else
  git checkout -b "$TARGET_BRANCH"
fi

if git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  git fetch "$REMOTE_NAME" --all --prune
else
  echo "⚠️ Remote '$REMOTE_NAME' not found. Continuing with local-only fusion."
fi

mapfile -t branches < <(git for-each-ref --format='%(refname:short)' refs/heads | grep -v "^${TARGET_BRANCH}$" || true)

if [[ ${#branches[@]} -eq 0 ]]; then
  echo "✅ No extra local branches to merge."
else
  echo "🔀 Merging branches into '$TARGET_BRANCH': ${branches[*]}"
  for branch in "${branches[@]}"; do
    git merge --no-ff "$branch"
  done
fi

echo

echo "🌌 Unified history view:"
git log --graph --decorate --oneline --all --date-order -n 30

echo

echo "🧹 To delete merged local branches:"
echo "git for-each-ref --format='%(refname:short)' refs/heads | grep -v '^${TARGET_BRANCH}$' | xargs -r -n 1 git branch -d"

echo

echo "🚀 To publish '${TARGET_BRANCH}' as your default branch timeline:"
echo "git push -u ${REMOTE_NAME} ${TARGET_BRANCH}"
