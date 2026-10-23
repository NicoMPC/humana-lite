#!/usr/bin/env bash
# Point de situation rapide du chantier Humana Lite — à lancer en début de
# session pour se repérer avant de reprendre le travail.
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "=== Humana Lite — état du chantier ($(date '+%Y-%m-%d %H:%M')) ==="
echo

echo "--- Git ---"
if git rev-parse --git-dir >/dev/null 2>&1; then
    echo "Branche : $(git branch --show-current)"
    echo "Dernier commit : $(git log -1 --format='%h %s (%cr)' 2>/dev/null || echo 'aucun commit')"
    REMOTE="$(git remote get-url origin 2>/dev/null || echo 'aucun remote')"
    echo "Remote : $REMOTE"
    AHEAD="$(git rev-list --count origin/main..HEAD 2>/dev/null || echo '?')"
    echo "Commits non poussés : $AHEAD"
    echo
    echo "Fichiers modifiés / non suivis :"
    git status --short || echo "(rien)"
else
    echo "Pas encore un dépôt git."
fi
echo

echo "--- Build ---"
if [ -f dist/index.html ] && [ -z "$(find src public index.html package.json -newer dist/index.html -type f 2>/dev/null | head -1)" ]; then
    echo "dist/ à jour par rapport aux sources."
else
    echo "dist/ absent ou périmé — lancer 'npm run build' pour vérifier que ça compile."
fi
echo

echo "--- Repères ---"
echo "Roadmap des lots       : docs/ROADMAP-EXECUTION.md"
echo "Vrai contenu cheveux V1 : docs/CONTENU-CHEVEUX-V1.md"
echo "Tracker accès/décisions : https://claude.ai/artifact/XU8wLqyYKhtb6hvr6gAnaz"
echo "  (toujours relire ce tracker en vrai via ArtifactData — ce script ne peut pas l'interroger lui-même)"
