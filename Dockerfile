# syntax=docker/dockerfile:1

FROM composer:2 AS composer_builder
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts \
    --ignore-platform-req=ext-mongodb

FROM node:20-alpine AS node_builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY resources ./resources
COPY vite.config.js ./
RUN npm run build

FROM php:8.2-cli-alpine
WORKDIR /var/www/html

RUN apk add --no-cache \
    bash \
    git \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    $PHPIZE_DEPS \
    sqlite-dev \
    unzip \
    zip \
 && docker-php-ext-install \
    bcmath \
    intl \
    mbstring \
    pdo \
    pdo_sqlite \
     zip \
 && pecl install mongodb \
 && docker-php-ext-enable mongodb

COPY --from=composer_builder /app/vendor ./vendor
COPY . .
COPY --from=node_builder /app/public/build ./public/build

RUN chmod +x ./scripts/render-start.sh

EXPOSE 10000

CMD ["sh", "./scripts/render-start.sh"]
