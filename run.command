#!/bin/bash
cd "$(dirname "$0")"

PORT=8000

if lsof -i :$PORT >/dev/null 2>&1; then
  echo "El puerto $PORT ya está en uso. Abriendo el navegador..."
else
  echo "Iniciando servidor en http://localhost:$PORT"
  python3 -m http.server $PORT &
  SERVER_PID=$!
  trap "kill $SERVER_PID 2>/dev/null" EXIT
  sleep 1
fi

open "http://localhost:$PORT/"

echo ""
echo "Servidor corriendo. Para detenerlo presioná Ctrl+C."

if [ -n "${SERVER_PID:-}" ]; then
  wait
fi
