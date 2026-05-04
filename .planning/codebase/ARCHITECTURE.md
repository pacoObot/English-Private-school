# Architecture

## Overview
Delson PS Academic is a modern web application built on the Next.js App Router, following a role-based access control (RBAC) model. It serves three main user groups: Administrators, Teachers, and Students.

## Layers

### Routing & UI (Next.js App Router)
- Uses file-based routing in `src/app/`.
- Role-specific sub-folders (`/admin`, `/teacher`, `/student`) encapsulate user-specific dashboards and features.
- Components are divided into `ui` (primitives) and `layout` (shared structural elements).

### Feature Modules (`src/features/`)
- Logic is organized by domain (auth, admin, teacher, student, debate).
- This structure promotes modularity and separation of concerns.

### Data Access (Prisma & Server Actions)
- **ORM**: Prisma provides a type-safe interface to the PostgreSQL database.
- **Server Actions**: Used for mutations and data fetching in Server Components, providing a secure and efficient way to handle server-side logic.
- **Middleware**: Handles authentication and role-based redirection.

### Security
- Password hashing for users.
- Role verification at the middleware and Server Action levels.
- Audit logging for critical actions (defined in `AuditLog` model).

## Data Model
The database schema follows a relational structure:
- **Core Entities**: `User`, `StudentProfile`, `TeacherProfile`.
- **Academic Entities**: `Course`, `ClassGroup`, `Enrollment`, `Grade`, `Attendance`.
- **Support Entities**: `StudyMaterial`, `Invoice`, `DebateSession`, `AuditLog`.
