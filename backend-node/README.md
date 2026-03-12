# Node Backend (Replaces PHP Backend)

This backend is implemented in JavaScript using:

- Node.js
- Express
- MongoDB (Mongoose)
- JWT authentication

## Run

1. Copy env file:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Start server:

```bash
npm run dev
```

The API base is:

- `http://localhost:8000/api/v1`

## Notes

- Response format matches the previous backend contract: `{ success, message, data }`.
- Auth uses Bearer JWT tokens.
- Role middleware supports `student`, `mentor`, `admin`, `super_admin`.

## Email Service (SMTP)

The backend now supports SMTP email notifications.

### Configure

Set these values in `.env`:

- `MAIL_ENABLED=true`
- `MAIL_HOST=smtp.your-provider.com`
- `MAIL_PORT=587`
- `MAIL_SECURE=false` (use `true` for port 465)
- `MAIL_USER=your-smtp-user`
- `MAIL_PASS=your-smtp-password`
- `MAIL_FROM_ADDRESS=no-reply@your-domain.com`
- `MAIL_FROM_NAME=UMPCFERI Portal`
- `APP_URL=http://localhost:5174`

If SMTP is not configured, the app continues to run and skips sending emails.

### Notification Events

Emails are sent for:

- Mentor account verification (admin action)
- Appointment confirmation (booking, admin approve, mentor confirm)
- Appointment cancellation (student cancel, mentor decline)
- Appointment completion (mentor marks complete)
