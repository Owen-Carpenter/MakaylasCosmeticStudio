This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📧 Email Configuration

The application uses [Resend](https://resend.com) for sending transactional emails. The following email types are implemented:

1. **Payment Receipts** - Sent when a customer successfully completes a booking payment
2. **Appointment Cancellations** - Sent when a customer cancels an appointment

### Configuration

Add your Resend API key to the environment variables in your `.env` file:

```
RESEND_API_KEY=your_resend_api_key
```

> **IMPORTANT**: Email functionality is server-side only. The `RESEND_API_KEY` is not prefixed with `NEXT_PUBLIC_` as it should only be accessible on the server.

### Server-Side Email Implementation

Emails are sent using server-side API routes:
- Payment receipts: `/api/emails/payment-receipt`
- Appointment cancellations: `/api/appointments/cancel`

These endpoints handle both the business logic and email sending in a server-side context where environment variables are accessible.

### Email Templates

The email templates are built using React Email components and can be found in:
- `src/lib/email/templates/PaymentReceipt.tsx`
- `src/lib/email/templates/AppointmentCancellation.tsx`

The email sending functionality is implemented in `src/lib/email/index.ts`

### Customization

To customize the email templates:
1. Edit the React components in the templates directory
2. Modify the styling using Tailwind classes
3. Update the email sending functions if needed

### Troubleshooting

If emails are not being sent:
1. Check that your Resend API key is correctly configured in the server environment
2. Ensure the API key is not accidentally prefixed with `NEXT_PUBLIC_`
3. Verify your domain is properly set up in the Resend dashboard
4. Check the server logs for any errors
5. Ensure you're only calling email functions from server-side code or API routes

## Email Functionality

The admin dashboard includes email functionality using the Resend API. To enable this feature:

1. Sign up for a free account at [Resend](https://resend.com)
2. Get your API key from the Resend dashboard
3. Add the following to your `.env.local` file:

```
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=your_verified_sender_email@yourdomain.com
```

Note: During development, you can use the default `onboarding@resend.dev` sender, but for production, you'll need to set up domain verification in the Resend dashboard.
