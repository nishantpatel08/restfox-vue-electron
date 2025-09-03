# 🚀 Restfox Deployment & Release Setup Guide

This document outlines the complete setup process for deploying and releasing the Restfox application with automated builds, packaging, and releases using GitHub Actions.

## 📋 Table of Contents

- [Overview](#overview)
- [Repository Migration](#repository-migration)
- [GitHub Actions Workflow Configuration](#github-actions-workflow-configuration)
- [Version Management](#version-management)
- [Release Process](#release-process)
- [Platform-Specific Builds](#platform-specific-builds)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)

## 🎯 Overview

Restfox is a sophisticated Electron application with automated deployment capabilities that:
- Builds for multiple platforms (Linux, Windows, macOS)
- Creates platform-specific packages (.deb, .rpm, .exe, .zip, .dmg)
- Generates Docker images
- Publishes to GitHub Releases
- Auto-generates changelogs and release notes

## 🔄 Repository Migration

### Step 1: Clone and Setup
```bash
# Clone the original repository
git clone https://github.com/flawiddsouza/Restfox.git
cd Restfox

# Add your new remote
git remote add origin https://github.com/nishantpatel08/restfox-vue-electron.git
git remote set-url origin https://github.com/nishantpatel08/restfox-vue-electron.git
```

### Step 2: Update Repository References
We updated all repository references from `flawiddsouza/Restfox` to `nishantpatel08/restfox-vue-electron` in the following files:

#### Core Configuration Files
- `packages/electron/package.json` - Main package configuration
- `packages/electron/forge.config.js` - Electron Forge configuration
- `.github/workflows/main.yml` - GitHub Actions workflow

#### Documentation Files
- `README.md` - Main documentation
- `docs/support.md` - Support information
- `docs/.vitepress/config.mts` - VitePress configuration

#### Application Files
- `packages/electron/dev.restfox.Restfox.metainfo.xml` - App metadata
- `packages/ui/src/plugin.spec.ts` - Plugin tests
- `packages/ui/src/parsers/curl.spec.ts` - cURL parser tests
- `packages/ui/src/components/modals/SettingsModal.vue` - Settings modal

#### Scripts
- `scripts/generate-changelog.js` - Changelog generation
- `docker-compose.yml` - Docker configuration

### Step 3: Commit Repository Changes
```bash
git add .
git commit -m "chore: update repository references from flawiddsouza/Restfox to nishantpatel08/restfox-vue-electron"
git push origin main
```

## ⚙️ GitHub Actions Workflow Configuration

### Current Workflow Status
The main workflow (`.github/workflows/main.yml`) is configured to:

#### ✅ **Enabled Builds**
- **Linux**: `.deb`, `.rpm`, `.flatpak` packages
- **Windows**: `.exe` installer and `.zip` archives
- **Release Notes**: Auto-generated changelogs

#### ⏸️ **Temporarily Disabled** (Require Credentials)
- **macOS**: `.dmg` files (needs Apple Developer certificates)
- **Snap**: Ubuntu snap packages (needs Snap Store credentials)
- **Docker**: Docker images (needs Docker Hub credentials)

### Workflow Triggers
```yaml
on:
  workflow_dispatch:  # Manual trigger with job selection
  push:
    tags:
      - 'v[0-9]+.[0-9]+.[0-9]+'  # Auto-trigger on version tags
```

### Manual Workflow Execution
You can manually trigger specific jobs:
1. Go to GitHub repository → Actions tab
2. Select "Publish Electron Binaries" workflow
3. Click "Run workflow"
4. Choose specific job or leave empty for all enabled jobs

## 📦 Version Management

### Version Bumping Script
The `scripts/bump-version.js` script handles automatic version management:

```bash
# Bump patch version (1.0.0 → 1.0.1)
node scripts/bump-version.js --patch

# Bump minor version (1.0.0 → 1.1.0)
node scripts/bump-version.js --minor

# Bump major version (1.0.0 → 2.0.0)
node scripts/bump-version.js --major

# Undo last version bump
node scripts/bump-version.js --undo
```

### What the Script Does
1. Updates version in `packages/electron/package.json`
2. Updates browser extension manifest version
3. Updates README.md version references
4. Commits changes with "chore: bump version" message
5. Creates Git tag (e.g., `v1.0.1`)

## 🚀 Release Process

### Complete Release Workflow

#### Step 1: Bump Version
```bash
node scripts/bump-version.js --patch
```

#### Step 2: Push Changes and Tag
```bash
git push origin main
git push origin v1.0.1
```

#### Step 3: GitHub Actions Automatically
1. **Builds UI** for desktop Electron
2. **Packages for platforms** using Electron Forge
3. **Creates GitHub release** with assets
4. **Generates release notes** with changelog
5. **Updates release description**

### Release Notes Generation
The `scripts/generate-changelog.js` script:
- Compares commits between the last two tags
- Categorizes changes (features, fixes)
- Generates formatted release notes
- Includes installation instructions for different platforms

## 🖥️ Platform-Specific Builds

### Linux Builds
- **Ubuntu/Debian**: `.deb` packages
- **Red Hat/Fedora**: `.rpm` packages
- **Universal**: `.flatpak` packages

### Windows Builds
- **Installer**: `.exe` using Squirrel
- **Portable**: `.zip` archives
- **Store**: `.appx` packages (Microsoft Store)

### macOS Builds (Currently Disabled)
- **Intel**: `.dmg` for x86_64
- **Apple Silicon**: `.dmg` for arm64
- **Code signing** and notarization required

### Snap Package (Currently Disabled)
- **Ubuntu**: Snap Store distribution
- **Automatic updates** through Snap Store

### Docker (Currently Disabled)
- **Multi-platform** Docker images
- **Versioned tags** and `latest` tag
- **Docker Hub** publication

## 🔧 Required GitHub Secrets

### For Future macOS Builds
```
CERTIFICATE_OSX_APPLICATION - macOS code signing certificate
CERTIFICATE_PASSWORD - Certificate password
APPLE_ID - Apple Developer ID
APPLE_ID_PASSWORD - Apple ID password
APPLE_TEAM_ID - Apple Developer Team ID
```

### For Future Snap Builds
```
SNAP_STORE_TOKEN - Snap Store authentication token
```

### For Future Docker Builds
```
DOCKERHUB_USERNAME - Docker Hub username
DOCKERHUB_TOKEN - Docker Hub access token
```

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
- Check GitHub Actions logs for specific error messages
- Verify Node.js version compatibility (currently using Node 22)
- Ensure all dependencies are properly installed

#### Version Bump Issues
- Verify Git is in clean state before bumping
- Check that package.json is properly formatted
- Ensure you have write permissions to the repository

#### Workflow Not Triggering
- Verify tag format matches `v[0-9]+.[0-9]+.[0-9]+`
- Check that workflow file is in `.github/workflows/` directory
- Ensure GitHub Actions are enabled for the repository

### Debugging Commands
```bash
# Check current version
git tag --sort=-version:refname | head -1

# View recent commits
git log --oneline -10

# Check workflow status
git status

# Verify remote configuration
git remote -v
```

## 🔮 Future Enhancements

### Re-enabling Disabled Builds

#### macOS Builds
1. Obtain Apple Developer certificates
2. Add required secrets to repository
3. Uncomment `build-electron-mac` job in workflow
4. Test with manual workflow trigger

#### Snap Builds
1. Create Snap Store account
2. Generate authentication token
3. Add `SNAP_STORE_TOKEN` secret
4. Uncomment `build-electron-snap` job

#### Docker Builds
1. Create Docker Hub account
2. Generate access token
3. Add Docker Hub secrets
4. Uncomment `build-docker-image` job

### Additional Features
- **Automated testing** before builds
- **Code quality checks** (ESLint, TypeScript)
- **Security scanning** for dependencies
- **Performance monitoring** for builds
- **Multi-repository** deployment support

## 📚 Additional Resources

### Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Electron Forge Documentation](https://www.electronforge.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)

### Related Scripts
- `scripts/update-release-notes.js` - Updates GitHub release descriptions
- `scripts/upload-file-to-latest-draft-release.js` - Uploads assets to releases

### Configuration Files
- `packages/electron/forge.config.js` - Electron Forge configuration
- `packages/electron/package.json` - Main package configuration
- `.github/workflows/main.yml` - GitHub Actions workflow

## 🎉 Success Metrics

### What You've Achieved
✅ **Automated Build Pipeline** - No manual intervention needed
✅ **Multi-Platform Support** - Linux and Windows builds working
✅ **Version Management** - Automatic version bumping and tagging
✅ **Release Automation** - GitHub releases with assets
✅ **Changelog Generation** - Auto-generated release notes
✅ **Professional Workflow** - Industry-standard deployment practices

### Current Status
- **Linux builds**: ✅ Working
- **Windows builds**: ✅ Working
- **macOS builds**: ⏸️ Disabled (needs credentials)
- **Snap builds**: ⏸️ Disabled (needs credentials)
- **Docker builds**: ⏸️ Disabled (needs credentials)
- **Release automation**: ✅ Fully functional

---

**Last Updated**: $(date)
**Version**: v1.0.1
**Repository**: nishantpatel08/restfox-vue-electron
