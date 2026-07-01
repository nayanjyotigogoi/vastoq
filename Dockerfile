# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

ENV NEXT_PUBLIC_API_URL=https://tohfaah.space
ENV NEXT_PUBLIC_APP_URL=https://myadkaro.online

# Copy source ( .dockerignore MUST exclude .next )
COPY . .

# Force clean build
RUN rm -rf .next && npm run build


# ---------- Runner ----------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy only what is needed to run Next.js
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
