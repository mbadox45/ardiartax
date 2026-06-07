# Stage 1: Install dependencies
FROM node:20-alpine AS deps
# Tambahkan gcompat jika menggunakan library native C++ tertentu (opsional namun aman)
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
# Menggunakan npm ci agar instalasi dependensi lebih cepat, konsisten, dan bersih
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variable saat build agar Next.js bisa menyuntikkan variabel env publik (NEXT_PUBLIC_) ke dalam bundle client-side
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# Menonaktifkan telemetri Next.js saat build untuk sedikit mempercepat proses
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Pindahkan pembuatan user ke atas sebelum penyalinan file untuk efisiensi layer caching
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set hak akses yang tepat saat menyalin berkas publik
COPY --from=builder /app/public ./public

# Set direktori cache .next agar bisa ditulis oleh user non-root (menghindari error permission NextJS)
RUN mkdir .next && chown nextjs:nodejs .next

# Salin aset hasil build standalone dengan kepemilikan user nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Jalankan server menggunakan standalone script bawaan Next.js
CMD ["node", "server.js"]