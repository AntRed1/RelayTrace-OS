# relaytrace-api

Backend NestJS de RelayTrace OS. Ver el [README raíz](../README.md) para la documentación completa del proyecto.

## Comandos rápidos

```bash
# Desarrollo con watch
npm run start:dev

# Build producción
npm run build
npm run start:prod

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Lint
npm run lint
```

## Prisma

```bash
npx prisma migrate dev --name <nombre>   # nueva migración
npx prisma migrate deploy                 # aplicar en producción
npx prisma generate                       # regenerar cliente
npx prisma studio                         # explorador visual
npx prisma db seed                        # seed inicial (roles + SUPER_ADMIN)
```

## Endpoints principales

- **API base:** `http://localhost:3000/api/v1`
- **Swagger UI:** `http://localhost:3000/api/docs`
- **Health:** `http://localhost:3000/api/v1/health`

## Variables de entorno

Copiar `.env.example` a `.env.local`. Ver el README raíz para la lista completa.
