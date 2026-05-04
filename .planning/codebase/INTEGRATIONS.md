# Integrations

## Database
- **PostgreSQL**: Primary data store for users, profiles, academic records, and audit logs. Accessed via Prisma.

## External Systems
- **UNIEXE**: (Planned) System for exporting academic data. Current state is "Initial" with a contract defined but no active connection yet.

## Authentication
- **Custom Middleware/Session**: Custom authentication logic using Next.js Middleware and likely cookie-based sessions (referenced in `PROJECT_STATUS.md` and `scripts/qa-responsive.mjs`).

## File Storage
- **Local/URL based**: `StudyMaterial` and `User` (avatarUrl) models support file URLs, but no specific provider (like S3/MinIO) is explicitly configured in dependencies beyond URLs.
