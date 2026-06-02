# ============================================================
# Stage 1: Builder
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias (incluyendo devDeps para compilar)
COPY package*.json ./
RUN npm ci

# Copiar fuentes, generar Prisma client y compilar
COPY . .
# DATABASE_URL is required by prisma.config.ts at load time even for generate.
# A dummy value is safe here — generate only reads the schema, never connects.
RUN DATABASE_URL="mysql://x:x@localhost:3306/x" npx prisma generate
RUN npm run build

# ============================================================
# Stage 2: Production
# ============================================================
FROM node:20-alpine AS production

WORKDIR /app

# Seguridad: usuario no-root
RUN addgroup -g 1001 -S nodejs && \
	adduser -S nestjs -u 1001

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar artefactos del builder
COPY --from=builder /app/dist ./dist
# Remove the compiled prisma.config.js — it's CommonJS output of an ESM file and
# causes Prisma to fail with a syntax parse error at startup. The .mjs version below
# is the correct one used by the entrypoint.
RUN rm -f dist/prisma.config.js
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

# Config de Prisma en ESM nativo (no compilado desde TS)
COPY prisma.config.mjs ./prisma.config.mjs

# Entrypoint script
COPY docker-entrypoint.sh ./docker-entrypoint.sh

# Cambiar ownership al usuario no-root
RUN chmod +x docker-entrypoint.sh && \
	chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
	CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

CMD ["./docker-entrypoint.sh"]