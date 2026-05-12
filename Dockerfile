# ============================================
# STAGE 1: BUILD
# ============================================
# Usa Node.js LTS alpine para build compacto e seguro
FROM node:20-bullseye-slim AS builder

# Instalar dependências do sistema necessárias para Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    ca-certificates \
    wget \
  && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar package*.json primeiro (melhor caching de camadas)
COPY package.json package-lock.json ./

# Instalar dependências (incluindo devDependencies necessárias para build)
RUN npm ci --only=production && \
    npm install --legacy-peer-deps @prisma/client prisma tsx typescript @types/node && \
    npm cache clean --force

# Copiar código fonte
COPY . .

# Gerar cliente Prisma para linux-musl (Alpine)
RUN npx prisma generate

# Build da aplicação Next.js
RUN npm run build

# ============================================
# STAGE 2: RUNTIME (Produção)
# ============================================
FROM node:20-bullseye-slim AS runtime

# Instalar dependências necessárias (dumb-init para sinais, netcat para healthcheck/entrypoint)
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    netcat \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Criar user não-root por segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copiar apenas os arquivos necessários do builder
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/docker/entrypoint.sh ./docker/entrypoint.sh

# Garantir permissão de execução no entrypoint
RUN chmod +x ./docker/entrypoint.sh

# Mudar para user não-root
USER nextjs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD nc -z localhost 3000 || exit 1

# Usar entrypoint script para gerenciar inicialização (migrations, wait-for-db)
ENTRYPOINT ["dumb-init", "--", "./docker/entrypoint.sh"]

# Comando padrão (passado como argumentos para o entrypoint)
CMD ["npm", "start"]

# ============================================
# STAGE 3: DEVELOPMENT
# ============================================
FROM node:20-bullseye-slim AS development

# Instalar dependências do sistema para Prisma + compilação + netcat para entrypoint + dumb-init
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    netcat \
    dumb-init \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar package*.json
COPY package.json package-lock.json ./

# Instalar todas as dependências (incluindo devDependencies)
RUN npm ci && npm cache clean --force

# Copiar código completo
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Garantir permissão de execução no entrypoint
RUN chmod +x ./docker/entrypoint.sh

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD nc -z localhost 3000 || exit 1

# Usar entrypoint script
ENTRYPOINT ["dumb-init", "--", "./docker/entrypoint.sh"]

# Comando padrão para desenvolvimento
CMD ["npm", "run", "dev"]
