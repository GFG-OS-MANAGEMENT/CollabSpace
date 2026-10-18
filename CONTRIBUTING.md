# Contributing to CollabSpace

Thank you for your interest in contributing to CollabSpace! The project aims to help college students discover projects and find teammates for academic, personal, and hackathon work.

CollabSpace is at the initial setup/boilerplate stage. Please check the current code and project discussions before assuming a feature or development workflow already exists.

## Ways to contribute

Depending on the current roadmap, contributions may include:

- React UI components and pages.
- Express API routes and backend logic.
- PostgreSQL and Prisma schema or database work.
- Bug fixes, tests, accessibility improvements, and documentation.
- Improvements to setup instructions and contributor experience.

## Before you start

1. Read the `README.md` and this guide.
2. Check existing issues and pull requests, if enabled, to avoid duplicate work.
3. For a substantial change, open or join a discussion before investing significant effort.
4. If no issue tracker or discussion area is available yet, contact a maintainer through the repository's available channels.

## Development setup

The intended architecture uses separate `client/` and `server/` directories:

- **Client:** React, JavaScript, Vite, and Tailwind CSS.
- **Server:** Node.js and Express.
- **Database:** PostgreSQL accessed through Prisma ORM.

Use the setup steps in `README.md` and the scripts present in each directory's `package.json`. Since the project may still be a scaffold, some setup steps may not be available yet. Do not assume scripts or environment variables exist if they have not been added.

Never commit secrets, access tokens, passwords, private keys, or local `.env` files. Use `.env.example` for documenting required variable names without real values.

## Suggested workflow

1. Fork the repository.
2. Clone your fork and enter the project directory.
3. Create a focused branch from the appropriate base branch. Examples:
   ```bash
   git checkout -b feat/project-listing
   git checkout -b fix/project-validation
   ```
4. Make a focused change that addresses one issue or improvement.
5. Run the checks available in the repository and test your changes where possible.
6. Review your diff and remove unrelated changes or sensitive information.
7. Commit with a clear message, then push your branch.
8. Open a pull request against the correct branch of the upstream repository.

Example commit messages:

- `feat: add project listing page`
- `fix: validate join request input`
- `docs: clarify local setup`

These are suggested conventions, not automated rules unless the repository later adds enforcement.

## Code guidelines

- Use JavaScript with `.js` and `.jsx` files; do not introduce TypeScript unless the project direction is explicitly changed.
- Follow the existing code style and naming conventions.
- Keep React components focused and reusable.
- Keep Express routes, controllers, middleware, and business logic organized according to the existing structure.
- Use Prisma for database access if it is configured in the area you are changing.
- Validate incoming data and handle errors clearly.
- Avoid adding dependencies unless they solve a real need; explain significant additions in the pull request.
- Update documentation when setup steps, scripts, environment variables, or behaviour change.
- Do not claim a check passed unless you actually ran it.

## Pull request checklist

Before submitting a pull request, make sure that:

- [ ] The change has a clear purpose and description.
- [ ] Related issues are referenced, if applicable.
- [ ] Existing functionality has not been unintentionally broken.
- [ ] Relevant tests or checks have been run, or limitations are explained.
- [ ] UI changes include screenshots when useful.
- [ ] Documentation is updated where necessary.
- [ ] No secrets, credentials, or unrelated generated files are included.

Maintainers may request changes or ask for clarification before merging. Keep discussion respectful and be open to feedback.

## Reporting bugs and suggesting features

When reporting a bug, include the steps to reproduce it, what you expected to happen, what actually happened, and relevant error messages or screenshots. Search existing issues first where possible.

For feature ideas, explain the problem the feature would solve and how it fits CollabSpace's purpose. Avoid opening duplicate reports.

## Code of Conduct

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

Thank you for helping make CollabSpace better!
