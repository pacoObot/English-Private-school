# Project: Delson PS Academic

## Objective
Academic management system for a private English school. It organizes students, teachers, classes, courses, payments, materials, evaluations, academic debates, and auditing.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Backend**: Server Actions, Prisma ORM, PostgreSQL
- **Frontend**: Tailwind CSS, React 18
- **QA**: Custom responsive QA engine (`qa:responsive`)

## Core Domains
- **Auth**: RBAC (Super Admin, Admin, Teacher, Student)
- **Admin**: CRUD operations for academic entities, invoicing, audit logs.
- **Student**: Personal dashboard for enrollments, grades, and finances.
- **Teacher**: Management of assigned classes, grading, and attendance.
- **Debate**: Evaluation and management of academic debates.
- **UNIEXE**: (Planned) Data export integration.

## Constraints & Principles
- **Mobile-First**: Design must be validated across 360px-430px viewports.
- **Continuity**: Project state is documented in `PROJECT_STATUS.md` and `TASK_LOG.md` for session persistence.
- **Security**: Audit logging for critical actions; Server Action validation.
