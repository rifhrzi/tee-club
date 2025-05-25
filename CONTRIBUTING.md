# Contributing to Teelite Club

Thank you for your interest in contributing to Teelite Club! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome newcomers and help them get started
- **Be collaborative**: Work together to improve the project
- **Be constructive**: Provide helpful feedback and suggestions

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js 18.0.0 or higher
- Git for version control
- A GitHub account
- Basic knowledge of React, Next.js, and TypeScript

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/your-username/tee-club.git
   cd tee-club
   ```

2. **Set up the development environment**
   ```bash
   # Install dependencies
   npm install
   
   # Copy environment template
   cp .env.example .env.local
   
   # Configure your environment variables
   # See docs/DEVELOPER.md for detailed setup instructions
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run seed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## How to Contribute

### Reporting Issues

Before creating an issue, please:
1. Check if the issue already exists
2. Use the issue templates provided
3. Include as much detail as possible

**Bug Report Template:**
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]
```

### Suggesting Features

For feature requests:
1. Use the feature request template
2. Explain the problem you're trying to solve
3. Describe your proposed solution
4. Consider alternative solutions

### Making Changes

#### 1. Create a Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

#### 2. Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

#### 3. Make Your Changes

Follow our coding standards:

**TypeScript Guidelines:**
```typescript
// Use proper interfaces
interface ProductProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

// Use proper error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('API call failed:', error);
  throw new Error('Failed to process request');
}
```

**Component Guidelines:**
```typescript
// Use functional components with proper typing
export function ProductCard({ product, onAddToCart }: ProductProps) {
  const [loading, setLoading] = useState(false);
  
  const handleAddToCart = useCallback(async () => {
    setLoading(true);
    try {
      await onAddToCart?.(product);
    } finally {
      setLoading(false);
    }
  }, [product, onAddToCart]);
  
  return (
    <div className="product-card">
      {/* Component JSX */}
    </div>
  );
}
```

**API Route Guidelines:**
```typescript
export async function POST(request: Request) {
  try {
    // Validate input
    const body = await request.json();
    const validatedData = schema.parse(body);
    
    // Process request
    const result = await processData(validatedData);
    
    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 4. Testing

Ensure your changes include appropriate tests:

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run type checking
npm run type-check
```

**Test Guidelines:**
- Write unit tests for new functions
- Add integration tests for API endpoints
- Update existing tests if behavior changes
- Aim for 80%+ code coverage

#### 5. Documentation

Update documentation when necessary:
- Update README.md for new features
- Add JSDoc comments for complex functions
- Update API documentation for new endpoints
- Add examples for new functionality

#### 6. Commit Your Changes

Follow conventional commit format:

```bash
# Commit format: type(scope): description
git commit -m "feat(cart): add quantity update functionality"
git commit -m "fix(auth): resolve login redirect issue"
git commit -m "docs(api): update endpoint documentation"
```

**Commit Types:**
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

#### 7. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create a pull request on GitHub
```

### Pull Request Guidelines

**PR Title Format:**
```
type(scope): brief description

Examples:
feat(cart): add product quantity controls
fix(auth): resolve session timeout issue
docs(readme): update installation instructions
```

**PR Description Template:**
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests for changes
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements in production code
```

### Code Review Process

1. **Automated Checks**: All PRs must pass CI/CD checks
2. **Peer Review**: At least one maintainer review required
3. **Testing**: Ensure all tests pass
4. **Documentation**: Verify documentation is updated

**Review Criteria:**
- Code quality and style
- Test coverage
- Performance impact
- Security considerations
- Documentation completeness

## Development Guidelines

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Format code
npm run format

# Check linting
npm run lint

# Fix linting issues
npm run lint --fix
```

### File Organization

```
src/
├── components/
│   ├── common/          # Shared components
│   ├── forms/           # Form components
│   └── ui/              # UI primitives
├── hooks/               # Custom hooks
├── lib/                 # Utility libraries
├── types/               # Type definitions
└── utils/               # Helper functions
```

### Naming Conventions

- **Files**: kebab-case (`product-card.tsx`)
- **Components**: PascalCase (`ProductCard`)
- **Functions**: camelCase (`addToCart`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`ProductProps`)

### Performance Guidelines

- Use `React.memo` for expensive components
- Implement proper loading states
- Optimize images with Next.js Image component
- Use dynamic imports for code splitting
- Minimize bundle size

### Security Guidelines

- Validate all user inputs
- Use parameterized queries
- Implement proper authentication checks
- Sanitize data before rendering
- Follow OWASP security guidelines

## Release Process

### Version Numbering

We follow Semantic Versioning (SemVer):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release branch
4. Run full test suite
5. Create GitHub release
6. Deploy to production

## Getting Help

### Resources

- [Documentation](docs/)
- [API Reference](docs/API.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Developer Guide](docs/DEVELOPER.md)

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Email**: [dev@teeliteclub.com](mailto:dev@teeliteclub.com)

### Mentorship

New contributors are welcome! If you're new to:
- **React/Next.js**: Check out the [Next.js documentation](https://nextjs.org/docs)
- **TypeScript**: See [TypeScript handbook](https://www.typescriptlang.org/docs/)
- **Open Source**: Read [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Annual contributor appreciation posts

## License

By contributing to Teelite Club, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Teelite Club! Your efforts help make this project better for everyone. 🎉
