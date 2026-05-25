# syntax=docker/dockerfile:1.7
# Runs `pnpm dev` in the container — mirrors local dev behavior.
# Note: this is the Next.js dev server. Unminified, hot-reload enabled, ~1.5 GB image.
# For a real production deploy, switch back to a standalone-output multi-stage build.

FROM node:22-alpine
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
# libc6-compat: required by some Next.js native deps on Alpine
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install deps first — cached separately from source changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# Copy the rest of the project.
COPY . .

EXPOSE 3000

# `-H 0.0.0.0` is required — `next dev` binds to localhost by default,
# which is unreachable from outside the container.
CMD ["pnpm", "exec", "next", "dev", "-H", "0.0.0.0", "-p", "3000"]
