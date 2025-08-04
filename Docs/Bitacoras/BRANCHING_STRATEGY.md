# Git Branching Strategy - GitFlow

## Overview
Este proyecto utiliza GitFlow como estrategia de branching para mantener un flujo de trabajo organizado y escalable.

## Branch Structure

### Main Branches

#### `main` (Production)
- **Propósito**: Código en producción
- **Protección**: Requiere Pull Request y aprobación
- **Deploy**: Automático a producción
- **Merge**: Solo desde `develop` o hotfixes

#### `develop` (Staging)
- **Propósito**: Código en staging/testing
- **Protección**: Requiere Pull Request
- **Deploy**: Automático a staging
- **Merge**: Desde feature branches

### Supporting Branches

#### Feature Branches
- **Formato**: `feature/descripcion-breve`
- **Origen**: `develop`
- **Destino**: `develop`
- **Ejemplos**:
  - `feature/user-authentication`
  - `feature/playlist-management`
  - `feature/payment-integration`

#### Release Branches
- **Formato**: `release/v1.0.0`
- **Origen**: `develop`
- **Destino**: `main` y `develop`
- **Propósito**: Preparar nueva versión

#### Hotfix Branches
- **Formato**: `hotfix/descripcion-breve`
- **Origen**: `main`
- **Destino**: `main` y `develop`
- **Propósito**: Correcciones urgentes en producción

## Workflow

### 1. Feature Development
```bash
# Crear feature branch
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# Desarrollo
git add .
git commit -m "feat: agregar nueva funcionalidad"

# Push y crear PR
git push origin feature/nueva-funcionalidad
```

### 2. Release Process
```bash
# Crear release branch
git checkout develop
git checkout -b release/v1.2.0

# Finalizar release
git checkout main
git merge release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"
git checkout develop
git merge release/v1.2.0

# Eliminar release branch
git branch -d release/v1.2.0
```

### 3. Hotfix Process
```bash
# Crear hotfix branch
git checkout main
git checkout -b hotfix/critical-bug-fix

# Corrección
git add .
git commit -m "fix: corregir bug crítico"

# Merge a main y develop
git checkout main
git merge hotfix/critical-bug-fix
git tag -a v1.2.1 -m "Hotfix v1.2.1"
git checkout develop
git merge hotfix/critical-bug-fix

# Eliminar hotfix branch
git branch -d hotfix/critical-bug-fix
```

## Commit Message Convention

### Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formato de código
- `refactor`: Refactorización
- `test`: Tests
- `chore`: Tareas de mantenimiento

### Examples
```
feat(auth): implementar autenticación con Supabase
fix(player): corregir reproducción en Safari
docs(api): actualizar documentación de endpoints
test(components): agregar tests para TrackCard
```

## Branch Protection Rules

### Main Branch
- Requiere Pull Request
- Requiere aprobación de al menos 1 reviewer
- Requiere que los tests pasen
- No permite force push

### Develop Branch
- Requiere Pull Request
- Requiere que los tests pasen
- No permite force push

## CI/CD Integration

### Automatic Triggers
- **Push to `develop`**: Deploy a staging
- **Push to `main`**: Deploy a producción
- **Pull Request**: Run tests y security scans

### Manual Triggers
- Deploy manual a staging desde cualquier branch
- Rollback desde tags específicos

## Best Practices

1. **Mantener branches actualizados**: Rebase regularmente con develop
2. **Commits atómicos**: Un commit por cambio lógico
3. **Descriptive names**: Usar nombres descriptivos para branches
4. **Delete merged branches**: Limpiar branches después del merge
5. **Tag releases**: Crear tags para cada release

## Tools and Automation

### GitHub Actions
- Automatización de CI/CD
- Security scanning
- Automated testing
- Deployment automation

### Branch Management
- Auto-delete merged branches
- Branch protection rules
- Required status checks 