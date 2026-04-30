# AI Shala Backend Deployment

## What this backend now expects

- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `ADMIN_EMAILS`
- `PAYMENT_PHONE`

Optional AI providers:

- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `OPENROUTER_API_KEY`
- `COHERE_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

## Production checklist

1. Create a real `.env` from `.env.example`.
2. Replace every placeholder secret with a real production value.
3. Point `ALLOWED_ORIGINS` at your live frontend domain.
4. Set `NODE_ENV=production`.
5. Configure your hosting platform to run `npm start` inside `backend/`.
6. Add a health check to `/api/health`.
7. Add a readiness check to `/api/ready`.
8. Create the Supabase tables used by auth, chat, image, tools, subscriptions, and admin analytics.

## Sales flow

- Free users can register and use the trial limits.
- Paid users submit a manual bKash/Nagad/Rocket/bank payment request.
- Admin approves the request and the backend upgrades the account.
- Chat, image generation, and tools only work when the needed AI provider key is present.

## Useful endpoints

- `GET /api/health`
- `GET /api/ready`
- `GET /api/models`
- `GET /api/subscriptions/plans`
- `GET /api/subscriptions/payment-methods`
