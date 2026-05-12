#!/bin/sh
# ============================================
# Docker Entrypoint Script
# Inicializa migrations, seed e inicia a aplicação
# ============================================

set -e

echo "================================================"
echo "🚀 Delson PS Academic - Docker Entrypoint"
echo "================================================"

# Variáveis
DB_HOST=${DATABASE_HOST:-postgres}
DB_PORT=${DATABASE_PORT:-5432}
DB_USER=${POSTGRES_USER:-delson}
DB_NAME=${POSTGRES_DB:-delson_ps}
MAX_RETRIES=30
RETRY_COUNT=0

echo "📡 Aguardando conexão com PostgreSQL em $DB_HOST:$DB_PORT..."

# Aguardar disponibilidade do banco de dados
while ! nc -z $DB_HOST $DB_PORT; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  
  if [ $RETRY_COUNT -gt $MAX_RETRIES ]; then
    echo "❌ Falha: PostgreSQL não disponível em $DB_HOST:$DB_PORT após $MAX_RETRIES tentativas"
    exit 1
  fi
  
  echo "⏳ PostgreSQL indisponível (tentativa $RETRY_COUNT/$MAX_RETRIES). Aguardando 2 segundos..."
  sleep 2
done

echo "✅ PostgreSQL conectado!"

# Aplicar migrações
echo ""
echo "📦 Aplicando migrações Prisma..."
npx prisma migrate deploy || {
  echo "⚠️  Migrações falharam. Verifique os logs do banco de dados."
  # Não sair com erro aqui para permitir que a app tente iniciar (pode estar ok)
}

# Carregar seed (apenas se no modo desenvolvimento E se solicitado)
if [ "$NODE_ENV" != "production" ]; then
  echo ""
  echo "🌱 Verificando necessidade de dados iniciais (seed)..."
  # Opcional: npx prisma db seed
  # Para evitar seeds repetidos em volumes persistentes, podíamos checar um arquivo
fi

echo ""
echo "================================================"
echo "✨ Inicializando aplicação: $@"
echo "================================================"
echo ""

# Executar o comando passado (CMD do Dockerfile)
exec "$@"
