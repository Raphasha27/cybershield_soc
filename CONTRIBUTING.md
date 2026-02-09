# 📝 Contributing to Raphasha27 Projects

Thank you for your interest in contributing! This project follows **Elite Engineering Standards** to maintain high architectural integrity and security.

## 🚀 Branching Strategy
- **`main`**: Production-ready code only.
- **`develop`**: Integration branch for upcoming releases.
- **`feature/`**: New features (e.g., `feature/ai-integration`).
- **`bugfix/`**: Critical fixes.
- **`refactor/`**: Improvements without changing behavior.

## 🛠️ Pull Request Process
1.  **Issue First**: Every PR must link to an existing GitHub Issue.
2.  **CI Validation**: All PRs must pass the build, lint, and security checks (Snyk/TruffleHog).
3.  **Review**: At least one architectural review is required. For self-managed projects, use the [Code Review Templates](./CODE_REVIEW_TEMPLATES.md).
4.  **Testing**: Unit tests are mandatory for all new logic (aim for 80%+ coverage).

## 🛡️ Security Policy
- **Never commit secrets**. Use `.env.example` templates.
- If you find a vulnerability, please open a private security advisory instead of a public issue.

---
*Elevating Software Engineering Standards, one commit at a time.*
