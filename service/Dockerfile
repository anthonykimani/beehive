FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY configs/ ./configs/
COPY middleware/ ./middleware/
COPY models/ ./models/
COPY repositories/ ./repositories/
COPY routes/ ./routes/
COPY utils/ ./utils/
COPY index.ts ./

RUN pnpm build

EXPOSE 3001

CMD ["pnpm", "start"]
