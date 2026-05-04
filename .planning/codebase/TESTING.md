# Testing

## Strategy
The current testing strategy focuses on static analysis, type safety, and manual/semi-automated visual validation.

## Tools
- **Type Checking**: `npx tsc --noEmit` ensures TypeScript integrity.
- **Linting**: `npm run lint` (ESLint) enforces coding standards.
- **Build Validation**: `npm run build` verifies production readiness.
- **Responsive QA**: `npm run qa:responsive` executes a custom script (`scripts/qa-responsive.mjs`) that:
  - Logs in via session cookies.
  - Captures screenshots across multiple viewports (360px to Desktop).
  - Checks for horizontal overflow.

## Current State
- **Unit Tests**: None.
- **Integration Tests**: None.
- **E2E Tests**: Semi-automated via `qa:responsive` script.
- **Coverage**: Focuses on UI responsiveness for Admin, Teacher, and Student routes.

## Future Requirements
- Implement unit tests for complex Server Actions (academic operations).
- Add integration tests for critical user flows (enrollment, grading).
- Integrate automated accessibility (a11y) checks.
