#!/usr/bin/env bash
# Regenerate CV-webpage.pdf straight from _data/cv.yml. Double-click this file.
#
# There is no separate LaTeX document to keep in sync any more: this prints
# the same cv-print.html page the website itself renders from that data, so
# the PDF can never say something different from the "CV" tab on the site.
#
# This only changes files on your Mac (CV-webpage.pdf and the "updated" date
# in _data/cv.yml). Run Publish Webpage afterwards to put the new PDF live.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

GEMS="$HOME/.dennis-math-preview/gems"
PORT=4002
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

say() { printf '\n%s\n' "$*"; }
finish() { printf '\n'; read -r -p "Press Return to close."; exit "${1:-0}"; }

if [ ! -x "$CHROME" ]; then
  say "This needs Google Chrome installed (used only to print the page to PDF)."
  echo "   Get it from https://www.google.com/chrome/ and try again."
  finish 1
fi

export GEM_HOME="$GEMS"
export PATH="$GEMS/bin:$PATH"
export JEKYLL_NO_BUNDLER_REQUIRE=true   # ignore the Gemfile; we manage our own gems

# ---- first run: install the tools (a few minutes, once) ----
if [ ! -x "$GEMS/bin/jekyll" ]; then
  say "First run: installing the page builder. This takes a few minutes, once only."
  echo "   (Nothing is downloaded again after this.)"
  mkdir -p "$GEMS" || { echo "Could not create $GEMS"; finish 1; }
  for g in "ffi:1.15.5" "json:2.7.6" "i18n:1.12.0" "public_suffix:4.0.7" "jekyll-sass-converter:1.5.2" "jekyll:3.9.5"; do
    printf '   installing %s\n' "${g%%:*}"
    gem install "${g%%:*}" -v "${g##*:}" --no-document >/dev/null 2>&1
  done
  for g in jekyll-seo-tag jekyll-sitemap kramdown-parser-gfm; do
    printf '   installing %s\n' "$g"
    gem install "$g" --no-document >/dev/null 2>&1
  done
  if [ ! -x "$GEMS/bin/jekyll" ]; then
    say "The builder could not be installed. Ask Claude."
    finish 1
  fi
  say "Done. That was a one-off."
fi

say "Building the CV page…"
BUILD_LOG="$(mktemp -t dennis-math-cv-build)"
jekyll build --destination "$HOME/.dennis-math-preview/cv-site" >"$BUILD_LOG" 2>&1
BUILD_STATUS=$?
sed 's/^/   /' "$BUILD_LOG"

if [ "$BUILD_STATUS" -ne 0 ] || [ ! -s "$HOME/.dennis-math-preview/cv-site/cv-print.html" ]; then
  say "The build failed. CV-webpage.pdf was not touched."
  echo "   The message above says why. If it is not obvious, show it to Claude."
  rm -f "$BUILD_LOG"
  finish 1
fi
rm -f "$BUILD_LOG"

# serve the parent folder so the /Dennis-Math/ prefix in the page resolves
cd "$HOME/.dennis-math-preview" || finish 1
rm -rf Dennis-Math && mv cv-site Dennis-Math
python3 -m http.server "$PORT" >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1' EXIT
sleep 1

cd - >/dev/null || finish 1

say "Printing the PDF…"
TMP_PDF="$(mktemp -t dennis-math-cv).pdf"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$TMP_PDF" \
  "http://localhost:$PORT/Dennis-Math/cv-print.html" >/dev/null 2>&1

if [ ! -s "$TMP_PDF" ]; then
  say "Chrome did not produce a PDF. Nothing was changed."
  rm -f "$TMP_PDF"
  finish 1
fi

mv "$TMP_PDF" CV-webpage.pdf

TODAY="$(date +'%-d %B %Y')"
sed -i '' -E "s/^updated: \".*\"\$/updated: \"$TODAY\"/" _data/cv.yml

say "Done. CV-webpage.pdf is up to date (dated $TODAY)."
echo "   This is only on your Mac so far. Run Publish Webpage to make it live."

finish 0
