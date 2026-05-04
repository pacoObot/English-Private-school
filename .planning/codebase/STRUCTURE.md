# Structure

## Root Directory
- `docs/`: Project documentation and state (Sprint history, status, etc.)
- `prisma/`: Database schema and seed scripts
- `qa/`: Quality assurance artifacts, including screenshots
- `scripts/`: Development and utility scripts (e.g., `qa-responsive.mjs`)
- `src/`: Main source code

## Source Directory (`src/`)
- `app/`: Next.js App Router routes and global styles
- `components/`:
  - `layout/`: Shared UI structures (Navbar, Sidebars)
  - `ui/`: Primitive UI components (Buttons, Inputs, etc.)
- `features/`: Domain-specific components and logic (Admin, Auth, Teacher, Student)
- `lib/`: Shared utilities, Prisma client, and mock data
- `middleware.ts`: Security and role-based routing logic

## Key Files
- `src/lib/prisma.ts`: Prisma client singleton
- `prisma/schema.prisma`: Source of truth for the data model
- `scripts/qa-responsive.mjs`: Automated responsive testing engine
- `package.json`: Dependency and script management
- `tailwind.config.ts`: UI design system configuration
