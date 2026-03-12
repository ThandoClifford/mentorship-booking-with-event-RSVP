## UMP Mentorship Portal Stack

This project now runs as:

- Frontend: React SPA (Vite)
- Backend: Node.js + Express API (`backend-node`, `/api/v1/*`)
- Database: MongoDB (Mongoose)

### Frontend Route Behavior

- All web routes are served by the React app through `routes/web.php`.
- API runtime is served by Node backend in `backend-node/src/routes/v1.js`.

### Local Development

1. Install frontend dependencies:

```bash
npm install
```

2. Install backend dependencies:

```bash
cd backend-node
npm install
```

3. Configure backend environment:

```bash
cp .env.example .env
```

4. Start app services:

```bash
cd backend-node
npm run dev

# in another terminal from project root
npm run dev
```

<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## API Documentation (Swagger)

This project uses `darkaonline/l5-swagger` for OpenAPI docs.

### Generate docs

```bash
php artisan l5-swagger:generate
```

### Open docs UI

- URL: `/api/documentation`
- Default local URL: `http://127.0.0.1:8000/api/documentation`

### Notes for mobile integration

- Keep API docs updated after route/controller changes.
- Use Bearer tokens in Swagger UI for protected endpoints.

## Hosting (Render)

This repository is prepared for Docker-based deployment on Render.

### 1. Push to GitHub

Ensure your latest changes are in GitHub.

### 2. Create Web Service on Render

1. In Render, choose `New` -> `Blueprint`.
2. Connect this GitHub repository.
3. Render will detect `render.yaml` and create the web service.

### 3. Set Required Environment Variable

- Set `APP_KEY` in Render environment variables (generate locally with `php artisan key:generate --show`).

### 4. Deploy

- Trigger deploy. The startup script will:
	- ensure SQLite file exists at `/var/data/database.sqlite`
	- run migrations
	- create storage symlink
	- start Laravel on Render port

### Notes

- Render free tier does not support persistent disk on web services; SQLite is configured at `/tmp/database.sqlite` (ephemeral).
- If you later move to MySQL/PostgreSQL, update DB env vars in Render.
