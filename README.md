# StreamFlow V1 - Music Discovery Platform

Una plataforma moderna de descubrimiento de música construida con React, Node.js y Supabase, implementando un pipeline CI/CD completo con DevOps best practices.

## 🚀 Características

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Docker
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe Integration
- **Deployment**: Vercel (Frontend) + Render (Backend)
- **CI/CD**: GitHub Actions
- **Security**: SonarQube + Trivy
- **Monitoring**: Health checks + Metrics

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Vercel)      │◄──►│   (Render)      │◄──►│  (Supabase)     │
│                 │    │                 │    │                 │
│  React + Vite   │    │  Node.js +      │    │  PostgreSQL     │
│  TypeScript     │    │  Express        │    │  Real-time      │
│  Tailwind CSS   │    │  Docker         │    │  Auth           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   CI/CD Pipeline│
                    │                 │
                    │  GitHub Actions │
                    │  SonarQube      │
                    │  Security Scan  │
                    │  Auto Deploy    │
                    └─────────────────┘
```

## 🛠️ Tecnologías

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component Library
- **React Router** - Navigation
- **React Query** - Data Fetching

### Backend
- **Node.js** - Runtime
- **Express** - Web Framework
- **Docker** - Containerization
- **Jest** - Testing
- **ESLint** - Code Quality

### DevOps & Infrastructure
- **GitHub Actions** - CI/CD Pipeline
- **Docker** - Containerization
- **Vercel** - Frontend Hosting
- **Render** - Backend Hosting
- **Supabase** - Database & Auth
- **SonarQube** - Code Quality
- **Trivy** - Security Scanning

## 🚀 Quick Start

### Prerrequisitos
- Node.js 18+
- Docker
- Git

### Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/your-username/streamflow-v1.git
cd streamflow-v1
```

2. **Instalar dependencias**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

3. **Configurar variables de entorno**
```bash
# Frontend (.env)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:3000

# Backend (.env)
NODE_ENV=development
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Ejecutar en desarrollo**
```bash
# Desarrollo completo (frontend + backend)
npm run dev:full

# Solo frontend
npm run dev

# Solo backend
npm run dev:backend
```

### Docker Development

```bash
# Backend con Docker
cd backend
docker-compose up

# Backend development con hot reload
docker-compose --profile dev up
```

## 🧪 Testing

### Frontend Tests
```bash
# Ejecutar tests
npm test

# Tests con UI
npm run test:ui

# Coverage
npm run test:coverage
```

### Backend Tests
```bash
# Ejecutar tests
cd backend
npm test

# Tests con watch
npm run test:watch

# Coverage
npm run test:coverage
```

### E2E Tests
```bash
# Próximamente con Playwright
npm run test:e2e
```

## 🚀 Deployment

### CI/CD Pipeline

El proyecto utiliza GitHub Actions para automatizar el proceso de CI/CD:

1. **Security Scan**: Análisis de vulnerabilidades con Trivy
2. **Code Quality**: ESLint + SonarQube
3. **Testing**: Jest + Vitest
4. **Build**: Docker image building
5. **Deploy**: Automático a staging/production

### Manual Deployment

#### Frontend (Vercel)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Backend (Render)
```bash
# Configurar en Render Dashboard
# Connect GitHub repository
# Set environment variables
# Deploy automatically
```

## 🔒 Security

### Implemented Security Measures

1. **Code Quality**
   - SonarQube analysis
   - ESLint rules
   - TypeScript strict mode

2. **Vulnerability Scanning**
   - Trivy container scanning
   - GitHub Security tab
   - Automated alerts

3. **Secrets Management**
   - GitHub Secrets
   - Environment variables
   - No hardcoded secrets

4. **HTTPS & Headers**
   - HTTPS enforced
   - Security headers
   - CORS configuration

### Security Checklist

- [x] HTTPS enforced
- [x] Security headers configured
- [x] CORS properly set
- [x] Input validation
- [x] SQL injection prevention
- [x] XSS protection
- [x] CSRF protection
- [x] Rate limiting
- [x] Secrets management
- [x] Vulnerability scanning

## 📊 Monitoring

### Health Checks
- **Frontend**: Vercel health monitoring
- **Backend**: `/health` endpoint
- **Database**: Supabase monitoring

### Metrics
- Response time
- Error rate
- Availability
- User metrics
- Business metrics

### Alerts
- Error rate > 5%
- Response time > 2s
- Service down
- Security incidents

## 🔄 Backup & Rollback

### Backup Strategy
- **Database**: Daily automated backups
- **Code**: Git version control
- **Configuration**: Environment variables

### Rollback Strategy
- **Frontend**: Vercel rollback
- **Backend**: Render rollback
- **Database**: Point-in-time recovery

## 📚 Documentation

- [Branching Strategy](./Docs/BRANCHING_STRATEGY.md)
- [Backup & Rollback Strategy](./Docs/BACKUP_AND_ROLLBACK_STRATEGY.md)
- [Development Roadmap](./Docs/DEVELOPMENT_ROADMAP.md)
- [Stripe Implementation](./Docs/IMPLEMENTACION_STRIPE_COMPLETA.md)
- [Admin Setup Guide](./Docs/ADMIN_SETUP_GUIDE.md)

## 🤝 Contributing

### Branching Strategy
Este proyecto utiliza GitFlow:

1. **Feature branches**: `feature/description`
2. **Release branches**: `release/v1.0.0`
3. **Hotfix branches**: `hotfix/description`

### Commit Convention
```
type(scope): description

feat(auth): implement user authentication
fix(player): resolve audio playback issue
docs(api): update endpoint documentation
```

### Pull Request Process
1. Create feature branch from `develop`
2. Implement changes
3. Add tests
4. Update documentation
5. Create PR to `develop`
6. Code review
7. Merge to `develop`
8. Deploy to staging

## 📈 Performance

### Frontend
- Lighthouse Score: 95+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s

### Backend
- Response Time: < 200ms
- Throughput: 1000+ req/s
- Uptime: 99.9%

## 🆘 Support

### Troubleshooting

#### Common Issues
1. **CORS Errors**: Check backend CORS configuration
2. **Build Failures**: Verify Node.js version and dependencies
3. **Deployment Issues**: Check environment variables

#### Getting Help
- [Issues](https://github.com/your-username/streamflow-v1/issues)
- [Discussions](https://github.com/your-username/streamflow-v1/discussions)
- [Documentation](./Docs/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for backend services
- [Vercel](https://vercel.com/) for frontend hosting
- [Render](https://render.com/) for backend hosting
- [Stripe](https://stripe.com/) for payment processing
- [Deezer](https://www.deezer.com/) for music API

---

**StreamFlow V1** - Modern Music Discovery Platform 🎵 