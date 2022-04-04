FROM node:latest
WORKDIR /app

RUN apt update
RUN apt install -y \
    libgconf-2-4 libatk1.0-0 libatk-bridge2.0-0 libgdk-pixbuf2.0-0 libgtk-3-0 libgbm-dev libnss3-dev libxss-dev \
    libasound2 \
    libxshmfence1 libglu1

RUN npm install -g pnpm

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install

# RUN chmod -R o+rwx node_modules/puppeteer/.local-chromium

COPY src src
COPY tsconfig.json .

RUN pnpm run build

RUN chmod -R o+rwx node_modules/puppeteer/.local-chromium

CMD ["pnpm", "start"]

