#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
PREFERRED_PORT="${PORT:-5000}"
FALLBACK_PORT="${FALLBACK_PORT:-8888}"
LOG_DIR="${LOG_DIR:-${COZE_WORKSPACE_PATH}/logs}"
LOG_FILE="${LOG_FILE:-${LOG_DIR}/dev.log}"

cd "${COZE_WORKSPACE_PATH}"
mkdir -p "${LOG_DIR}"

exec > >(tee -a "${LOG_FILE}") 2>&1
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting dev log stream at ${LOG_FILE}"

is_port_listening() {
    local port="$1"

    if command -v lsof >/dev/null 2>&1; then
        lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
        return
    fi

    if command -v ss >/dev/null 2>&1; then
        ss -H -lnt 2>/dev/null | awk -v port="${port}" '$4 ~ ":"port"$"' | grep -q .
        return
    fi

    return 1
}

if is_port_listening "${PREFERRED_PORT}"; then
    echo "Port ${PREFERRED_PORT} is already in use, trying fallback port ${FALLBACK_PORT}."
    if is_port_listening "${FALLBACK_PORT}"; then
        echo "Port ${FALLBACK_PORT} is also in use. Please free one of the ports and retry."
        exit 1
    fi
    PORT="${FALLBACK_PORT}"
else
    PORT="${PREFERRED_PORT}"
fi

echo "Starting HTTP service on port ${PORT} for dev..."
PORT="${PORT}" pnpm exec tsx watch src/server.ts
