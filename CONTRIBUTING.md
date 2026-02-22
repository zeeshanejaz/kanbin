# Contributing to Kanbin

Thank you for your interest in contributing to Kanbin! We welcome contributions from the community.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/zeeshanejaz/kanbin.git
   cd kanbin
   ```
3. **Follow the setup instructions** in the [Local Development Guide](docs/local-dev.md)

## Development Workflow

We follow trunk-based development. Please refer to [`.specs/constitution.md`](.specs/constitution.md) for detailed guidelines on:

- Git workflow and branching strategy
- Commit message conventions
- Code style (Go and TypeScript/React)
- Code quality standards

### Quick Summary

- **Branch naming**: `feature/<short-name>`, `bugfix/<short-name>`, or `hotfix/<short-name>`
- **Commit messages**: Follow Conventional Commits format
  ```
  feat: add board export functionality
  fix: resolve drag-drop positioning bug
  docs: update API documentation
  ```
- **Code style**: 
  - Go: Follow standard Go conventions, use `gofmt`
  - TypeScript/React: Follow project ESLint configuration
- **Tests**: Write tests for new features and bug fixes
- **Rebase**: Keep your branch up-to-date by rebasing on `main`

## Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards in `.specs/constitution.md`

3. **Test your changes**:
   ```bash
   task test
   task lint
   ```

4. **Commit your changes** with clear, descriptive commit messages

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** on GitHub:
   - Provide a clear description of the changes
   - Reference any related issues
   - Ensure all checks pass (linting, tests, builds)

7. **Respond to review feedback** and make necessary updates

### PR Checklist

Before submitting your PR, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass (`task test`)
- [ ] Linting passes (`task lint`)
- [ ] Code builds successfully (`task build`)
- [ ] Documentation is updated (if applicable)
- [ ] Commit messages follow Conventional Commits
- [ ] Branch is rebased on latest `main`

## Code Review Guidelines

- PRs require at least one approval before merging
- Address all review comments before requesting re-review
- Keep PRs focused on a single feature or fix
- Break large changes into smaller, reviewable PRs

## Reporting Issues

If you find a bug or have a feature request:

1. **Check existing issues** to avoid duplicates
2. **Create a new issue** with a clear title and description
3. **Provide context**: Steps to reproduce (for bugs), use case (for features)
4. **Include environment details**: OS, Go version, Node version, etc.

## Questions?

- Review the [project specifications](.specs/) for detailed requirements
- Check the [documentation](docs/) for architecture and API details
- Open a GitHub Discussion for general questions

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers and help them get started
- Focus on what is best for the project and community

Thank you for contributing to Kanbin! 🎉
