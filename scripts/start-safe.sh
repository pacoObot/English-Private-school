#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

APP_URL="http://localhost:${APP_PORT:-3000}"

usage() {
  cat <<'EOF'
Uso seguro:
  scripts/start-safe.sh dev       Sobe Docker dev, aplica migrations e mostra URL
  scripts/start-safe.sh status    Mostra estado dos containers e migrations
  scripts/start-safe.sh logs      Mostra logs da aplicação
  scripts/start-safe.sh stop      Para containers sem apagar volumes

Regras:
  - Nunca executa docker compose down -v.
  - Nunca imprime segredos do .env.
  - Nunca faz migrate reset.
EOF
}

need_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Erro: comando obrigatório não encontrado: $1" >&2
    exit 1
  fi
}

ensure_env_file() {
  if [[ ! -f .env ]]; then
    if [[ ! -f .env.example ]]; then
      echo "Erro: .env não existe e .env.example não foi encontrado." >&2
      exit 1
    fi

    cp .env.example .env
    chmod 600 .env
    echo "Criado .env a partir de .env.example com permissão 600."
    echo "Revise os valores antes de usar em produção."
  fi
}

ensure_not_production_with_default_secret() {
  if grep -q '^NODE_ENV=["'\'']\?production' .env 2>/dev/null; then
    if grep -q 'local-dev-secret-change-before-production-delson-ps' .env 2>/dev/null; then
      echo "Erro: .env está em produção com AUTH_SECRET padrão. Gere um segredo real antes de iniciar." >&2
      echo "Sugestão: openssl rand -base64 32" >&2
      exit 1
    fi
  fi
}

compose() {
  docker compose "$@"
}

wait_for_service() {
  local service="$1"
  local label="$2"
  local tries=45

  echo "Aguardando $label ficar saudável..."
  for _ in $(seq 1 "$tries"); do
    local status
    status="$(compose ps --format json "$service" 2>/dev/null | tr -d '\n' | sed -n 's/.*"Health":"\([^"]*\)".*/\1/p')"

    if [[ "$status" == "healthy" ]]; then
      echo "$label está saudável."
      return 0
    fi

    sleep 2
  done

  echo "Aviso: não consegui confirmar healthcheck de $label a tempo." >&2
  compose ps
  return 1
}

run_migrations_safely() {
  echo "Aplicando migrations pendentes com Prisma deploy..."
  compose exec -T app npx prisma migrate deploy

  echo "Estado das migrations:"
  compose exec -T app npx prisma migrate status
}

dev() {
  need_command docker
  ensure_env_file
  ensure_not_production_with_default_secret

  echo "A iniciar Delson PS em modo desenvolvimento seguro..."
  compose up -d --build
  wait_for_service postgres "PostgreSQL"
  run_migrations_safely

  echo "Aplicação disponível em: $APP_URL"
  echo "Logs: scripts/start-safe.sh logs"
  echo "Parar sem apagar dados: scripts/start-safe.sh stop"
}

status() {
  need_command docker
  ensure_env_file
  compose ps

  if compose ps --services --filter status=running | grep -qx app; then
    echo
    echo "Estado das migrations:"
    compose exec -T app npx prisma migrate status || true
  fi
}

logs() {
  need_command docker
  compose logs -f app
}

stop() {
  need_command docker
  echo "Parando containers sem apagar volumes..."
  compose down
}

case "${1:-dev}" in
  dev) dev ;;
  status) status ;;
  logs) logs ;;
  stop) stop ;;
  -h|--help|help) usage ;;
  *)
    usage
    exit 1
    ;;
esac
