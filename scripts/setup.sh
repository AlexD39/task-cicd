#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_dir"

npm ci
npm run build
printf 'TaskFlow está listo. Ejecuta npm test para validar el proyecto.\n'
