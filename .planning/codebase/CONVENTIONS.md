# Conventions

## General
- **Language**: TypeScript (strict mode preferred).
- **Component Style**: Functional components with Hooks.
- **Styling**: Utility-first CSS with Tailwind. Custom scrollbars and transitions are encouraged.
- **File Naming**: 
  - Components: `PascalCase.tsx`
  - Utilities/Logic: `camelCase.ts`
  - Routes: `page.tsx`, `layout.tsx` (Next.js standards)

## Project Structure
- **Path Aliases**: Use `@/` to reference the `src/` directory.
- **Feature Isolation**: Domain logic should live in `src/features/[feature-name]`.
- **UI Primitives**: Shared atomic components live in `src/components/ui/` and are exported via `index.ts`.

## Data Handling
- **Server Actions**: Use Server Actions for all data mutations.
- **ORM**: Always use the Prisma client singleton from `@/lib/prisma`.
- **Type Safety**: Leverage Prisma's generated types for data models and role-based logic.

## UI/UX
- **Responsiveness**: Mobile-first design (validated by `npm run qa:responsive`).
- **Feedback**: Use `ActionNotice` and `EmptyState` components to provide user feedback.
- **Icons**: Use `lucide-react`.
