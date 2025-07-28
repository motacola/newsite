# GitHub Actions CI/CD Setup

This directory contains GitHub Actions workflows for continuous integration and deployment.

## Workflows

### 1. CI (`ci.yml`)
- **Trigger**: Push to `main` or `develop` branches, PRs to these branches
- **Purpose**: Run tests, linting, type checking, and build verification
- **Matrix**: Tests on Node.js 18.x and 20.x

### 2. Deploy to Staging (`deploy-staging.yml`)
- **Trigger**: Push to `develop` branch
- **Purpose**: Deploy to Netlify staging environment
- **Environment**: Staging/preview deployment

### 3. Deploy to Production (`deploy-production.yml`)
- **Trigger**: Push to `main` branch
- **Purpose**: Deploy to Netlify production environment
- **Environment**: Production deployment

### 4. PR Validation (`pr-validation.yml`)
- **Trigger**: Pull requests to `main` or `develop`
- **Purpose**: Validate PRs with comprehensive testing and build checks
- **Features**: Automated PR comments with build status

### 5. Dependency Update (`dependency-update.yml`)
- **Trigger**: Weekly schedule (Mondays 9 AM UTC) or manual
- **Purpose**: Automated dependency updates with testing
- **Features**: Creates PRs with dependency updates

## Required Secrets

To enable deployment workflows, add these secrets to your GitHub repository:

1. **NETLIFY_AUTH_TOKEN**: Your Netlify personal access token
   - Go to Netlify → User Settings → Applications → Personal access tokens
   - Generate new token and add to GitHub Secrets

2. **NETLIFY_SITE_ID**: Your Netlify site ID
   - Found in Netlify site settings → General → Site details
   - Site ID: `4f6a2f28-6226-4646-b671-42c68fc4128f`

## Branch Strategy

- **main**: Production branch - triggers production deployment
- **develop**: Development branch - triggers staging deployment
- **feature/***: Feature branches - run CI tests only

## Setup Instructions

1. Ensure your repository has both `main` and `develop` branches
2. Add required secrets to GitHub repository settings
3. Configure Netlify site with the provided site ID
4. Push changes to trigger workflows

## Local Development

Before pushing, ensure your code passes local checks:

```bash
npm run lint          # Check code style
npm run type-check    # Verify TypeScript
npm run test:ci       # Run all tests
npm run build         # Verify build works
```

## Troubleshooting

- **Build failures**: Check the Actions tab for detailed logs
- **Deployment issues**: Verify Netlify secrets are correctly set
- **Test failures**: Run tests locally first with `npm run test:ci`