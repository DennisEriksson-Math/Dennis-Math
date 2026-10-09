#!/usr/bin/env bash
# Copy the latest build of the algebraic geometry book from Dropbox into the
# site, so the "Lecture notes" link on the Teaching tab shows its current state.
# Double-click this file, then run Publish Webpage to make it live.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

DEST="teaching/MMA321-Algebraic-Geometry-notes-preliminary.pdf"

# The newest build wins: either the one in the Dropbox book folder, or a fresh
# download from the book project (saved as Algebraic_geometry...book....pdf).
SRC="$(ls -t "$HOME"/Library/CloudStorage/Dropbox/algebraic-geometry-book/AlgGeom*.pdf \
              "$HOME"/Downloads/Algebraic_geometry*book*.pdf 2>/dev/null | head -1)"

say() { printf '\n%s\n' "$*"; }
finish() { printf '\n'; read -r -p "Press Return to close."; exit "${1:-0}"; }

[ -n "$SRC" ] && [ -f "$SRC" ] || { say "Could not find a book PDF in Dropbox (algebraic-geometry-book/) or Downloads."; finish 1; }
echo "Using: $SRC"

if cmp -s "$SRC" "$DEST" 2>/dev/null; then
  say "Already up to date - the site's copy matches the book in Dropbox."
  finish 0
fi

mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST" || { say "Copy failed. Nothing was changed."; finish 1; }

say "Copied the current book into the site ($(du -h "$DEST" | cut -f1))."
echo "   Built: $(stat -f '%Sm' -t '%-d %B %Y, %H:%M' "$SRC")"
echo "   This is only on your Mac so far. Run Publish Webpage to make it live."
finish 0
