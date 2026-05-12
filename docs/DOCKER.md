# 🐳 Dockerização - Delson PS Academic

Este guia detalha como usar Docker para desenvolvimento e produção.

## 📋 Arquivos criados

```
.
├── Dockerfile                  # Multi-stage: builder + runtime + development
├── .dockerignore              # Exclusões para build
├── docker-compose.yml         # Composição para desenvolvimento (padrão)
├── docker-compose.prod.yml    # Composição para produção
├── docker/entrypoint.sh       # Script de inicialização seguro
├── .env                       # Variáveis de ambiente (local)
├── .env.example               # Template de variáveis (commit no git)
└── docs/DOCKER.md             # Este arquivo
```

---

## 🚀 Desenvolvimento

### Pré-requisitos

- **Docker**: v20.10+
- **Docker Compose**: v2.0+
- **Git**: para controlar versão

### Iniciar Stack em Desenvolvimento

```bash
# 1. Clone o repositório
git clone <repo_url>
cd Delson_PS

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env se necessário (portas, senhas, etc)

# 3. Inicie os serviços
docker compose up -d

# 4. Verifique o status
docker compose ps
docker compose logs -f app

# 5. Acesse a aplicação
# App: http://localhost:3000
# Banco: localhost:5432 (postgres)
```

### Desenvolvimento com Hot-Reload

A pasta do projeto está montada como volume, permitindo edições em tempo real:

```bash
# Editar código - as mudanças são refletidas automáticamente
vim src/app/page.tsx

# Ver logs em tempo real
docker compose logs -f app

# Acessar shell do container
docker compose exec app sh
```

### Aplicar Migrações

```bash
# Migrações são aplicadas automaticamente no startup
# Para aplicar manualmente:
docker compose exec app npx prisma migrate dev

# Ver estado das migrações
docker compose exec app npx prisma migrate status
```

### Carregar Dados Iniciais (Seed)

```bash
# Seed é carregado automaticamente em desenvolvimento
# Para recarregar manualmente:
docker compose exec app npx prisma db seed

# Resetar banco completamente
docker compose exec app npx prisma migrate reset
```

### Acessar PostgreSQL

```bash
# Via psql dentro do container
docker compose exec postgres psql -U delson -d delson_ps

# Via cliente local (se instalado)
psql -h localhost -U delson -d delson_ps
# Senha: delson_dev_password

# Comandos úteis no psql
\dt                    # Listar tabelas
\d users               # Ver schema da tabela
SELECT COUNT(*) FROM users;  # Contar registros
```

### Parar e Limpar

```bash
# Parar serviços (mantém dados)
docker compose down

# Parar e remover volumes (APAGA dados!)
docker compose down -v

# Remover imagens também
docker compose down -v --rmi all
```

---

## 🏭 Produção

### Preparação

```bash
# 1. Configure arquivo de produção
cp .env.example .env.prod
# Edite .env.prod com valores reais:
# - POSTGRES_PASSWORD: senha forte aleatória
# - AUTH_SECRET: gerar com `openssl rand -base64 32`
# - Outros valores específicos do ambiente

# 2. Gere secrets seguros
AUTH_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 16)
```

### Iniciar Stack em Produção

```bash
# 1. Construir imagem otimizada
docker compose -f docker-compose.prod.yml build

# 2. Iniciar serviços com arquivo de produção
docker compose -f docker-compose.prod.yml up -d

# 3. Verifique o status
docker compose -f docker-compose.prod.yml ps

# 4. Ver logs
docker compose -f docker-compose.prod.yml logs app

# 5. A aplicação estará em http://localhost:3000
```

### Atualizações em Produção

```bash
# 1. Fazer pull da nova versão
git pull origin main

# 2. Reconstruir imagem
docker compose -f docker-compose.prod.yml build

# 3. Atualizar serviços (com downtime zero se possível)
docker compose -f docker-compose.prod.yml up -d

# 4. Verificar migração automática
docker compose -f docker-compose.prod.yml logs app | grep "migrat"
```

### Backup do Banco de Dados

```bash
# Fazer backup manual
docker compose exec postgres pg_dump -U delson delson_ps > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar de um backup
docker compose exec -T postgres psql -U delson delson_ps < backup_20240505_120000.sql
```

### Monitoramento

```bash
# Ver recursos utilizados
docker stats delson_ps_app_prod delson_ps_postgres_prod

# Ver logs estruturados
docker compose logs --timestamps app

# Seguir logs em tempo real
docker compose logs -f app
```

---

## 🔐 Segurança

### Implementadas

- ✅ **Multi-stage builds**: Reduz tamanho da imagem (devDependencies removidas)
- ✅ **Non-root user**: App roda como usuário `nextjs` (UID 1001)
- ✅ **Alpine Linux**: Base mínima reduz superfície de ataque
- ✅ **Health checks**: Monitora saúde dos serviços
- ✅ **Resource limits**: Produção com limites de CPU e memória
- ✅ **No new privileges**: Security option no Docker
- ✅ **Environment variables**: Secrets via variáveis (não hardcoded)

### Recomendações

- [ ] Usar secret manager em produção (AWS Secrets Manager, HashiCorp Vault, etc)
- [ ] Implementar network policies entre containers
- [ ] Usar registry privado (ECR, Harbor, etc)
- [ ] Escanear imagens por vulnerabilidades (Trivy, Aqua, etc)
- [ ] Implementar autenticação no Docker daemon
- [ ] Usar HTTPS com proxy reverso (Nginx, Traefik)
- [ ] Monitorar e fazer logs centralizados

---

## 🛠️ Troubleshooting

### App não conecta ao banco

```bash
# Verificar se PostgreSQL está pronto
docker compose exec postgres pg_isready -U delson

# Verificar variáveis de ambiente no app
docker compose exec app env | grep DATABASE

# Ver logs do entrypoint
docker compose logs postgres
```

### Porta já em uso

```bash
# Mudar porta em .env:
# APP_PORT="3001"
# DB_PORT="5433"

# Ou liberar porta:
sudo lsof -i :3000  # Ver o que está usando
kill -9 <PID>       # Forçar encerramento
```

### Migrações falhando

```bash
# Ver logs completos
docker compose logs app | grep -i migrat

# Executar migração com verbose
docker compose exec app npx prisma migrate dev --verbose

# Resetar banco (CUIDADO - apaga tudo)
docker compose exec app npx prisma migrate reset --force
```

### Sem permissão para modificar volumes

```bash
# Restaurar permissões
sudo chown -R $USER:$USER .

# Ou usar Docker em modo rootless (recomendado)
# Ver: https://docs.docker.com/engine/security/rootless/
```

---

## 📊 Estrutura de Containers

### Desenvolvimento

```
┌─────────────────────────────────────┐
│   Host (localhost)                  │
├─────────────────────────────────────┤
│ Port 3000 ──────→ delson_ps_app     │
│ Port 5432 ──────→ delson_ps_postgres│
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ delson_network (bridge)         │ │
│ │ - app     (node:20-alpine)      │ │
│ │ - postgres (postgres:16-alpine) │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Volumes:                            │
│ - postgres_data (BD persistente)   │
│ - postgres_logs (Logs do BD)       │
│ - . (código hot-reload)            │
└─────────────────────────────────────┘
```

### Produção

```
┌─────────────────────────────────────┐
│   Host (production)                 │
├─────────────────────────────────────┤
│ Port 3000 ──────→ delson_ps_app_prod│
│ Port 5432 ──────→ delson_ps_postgres│
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ delson_network_prod (bridge)    │ │
│ │ - app     (node:20-alpine)      │ │
│ │ - postgres (postgres:16-alpine) │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Volumes:                            │
│ - postgres_data_prod (BD persistente)
│ - postgres_backups (Backups)        │
└─────────────────────────────────────┘
```

---

## 📚 Referências

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

---

## 📝 Próximos Passos

- [ ] Adicionar Redis para cache
- [ ] Adicionar pgAdmin para UI de gerenciar banco
- [ ] Implementar CI/CD com GitHub Actions
- [ ] Adicionar Nginx reverse proxy
- [ ] Configurar autoscaling
- [ ] Adicionar monitoring (Prometheus, Grafana)
- [ ] Implementar log aggregation (ELK Stack, Loki)
