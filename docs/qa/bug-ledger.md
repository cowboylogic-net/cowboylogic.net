# Bug Ledger

Use this ledger to track defects discovered during smoke tests, QA passes, or production verification.

## Severity Guide

- `P0`: Critical outage or data-loss/security impact. Core flows blocked for most users.
- `P1`: Major functional break in an important flow with workaround missing or poor.
- `P2`: Minor/isolated defect with acceptable workaround; does not block release alone.

## Template

| module | severity (P0/P1/P2) | steps to reproduce | expected | actual | evidence (screenshots/console/network) | done criteria | owner | date |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Example: Auth / Login | P1 | 1) Open login page 2) Submit valid credentials 3) Refresh | User remains logged in | User is redirected to login after refresh | Console error + network 401 screenshot | Refresh keeps active session; regression test added | @owner | 2026-02-18 |

