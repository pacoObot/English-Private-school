# Concerns

## Technical Debt
- **Missing Automated Tests**: No unit or integration tests for core business logic in Server Actions.
- **Error Handling**: Prisma uniqueness errors are not handled with user-friendly messages in admin forms.
- **UX**: Inline forms in long lists need UX improvements for better usability.

## Functional Gaps
- **UNIEXE Integration**: The export functionality is in an initial state and lacks real implementation/connectivity.
- **Financial Module**: A dedicated financial page is needed as the volume of invoices grows.
- **Monthly Fees**: Persisting monthly fees (mensalidade) in a dedicated enrollment field is pending; currently reflected in `Invoice.amountMt`.

## Security & Maintenance
- **Audit Log Detail**: Ensure all critical operations are capturing sufficient metadata in `AuditLog`.
- **Database Migrations**: Be cautious of empty migration artifacts (previously encountered and fixed).

## Potential Risks
- Scalability of the financial summary if data grows significantly without optimization.
- Manual verification overhead without more comprehensive automated testing.
