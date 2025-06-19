# App Blueprint: ServiceFlow Pro  

## 1. Project Breakdown  
**App Name**: ServiceFlow Pro  
**Platform**: Web (Next.js)  
**Summary**: ServiceFlow Pro is a service-based e-commerce boilerplate designed for businesses offering appointment-driven services (e.g., salons, consulting, repairs). It streamlines booking, payments, and customer management with a modern UI, secure authentication, and integrated analytics.  
**Primary Use Case**:  
- Customers browse services, book appointments, and pay via Stripe.  
- Admins manage appointments, view analytics, and track conversions via PostHog.  
**Authentication**:  
- NextAuth + Supabase for OAuth (Google/GitHub) and email/password login.  
- User roles (customer/admin) stored in Supabase.  

---  

## 2. Tech Stack Overview  
**Frontend Framework**: Next.js 14 (App Router) + React  
**UI Library**: Tailwind CSS (theming) + ShadCN (pre-built components)  
**Backend**: Supabase (PostgreSQL DB, Auth, Storage)  
**APIs**:  
- Stripe (payments)  
- Resend (transactional emails)  
- PostHog (analytics)  
**Deployment**: Vercel (serverless functions for API routes)  

---  

## 3. Core Features  
### Backend  
- **Auth**: NextAuth with Supabase sessions. Stores: `user(id, name, email, phone, role)`  
- **Bookings**: Supabase table `appointments(id, userId, serviceType, serviceLength, status, appointmentDate, dateCreated)`  
- **Payments**: Stripe Checkout with webhooks to update booking status.  
- **Emails**: Resend sends receipts post-payment.  
- **Analytics**: PostHog tracks pageviews, checkout funnel, and admin dashboards.  

### Frontend (Customer)  
- **Landing Page**: Hero section, auth CTA, service preview.  
- **Services**: Filterable grid (ShadCN Card) with service details (cost, duration).  
- **Booking**: ShadCN form + React Calendar integration. Redirects to Stripe.  
- **Profile**: Edit contact info, reset password (NextAuth).  

### Frontend (Admin)  
- **Dashboard**: PostHog-embedded charts (conversions, revenue).  
- **Appointments**: ShadCN Data Table with filters (status, date).  

---  

## 4. User Flow  
1. **Customer**:  
   - Lands on homepage → Clicks "Services" → Selects service → Books slot → Pays via Stripe → Receives Resend email → Views appointment in dashboard.  
2. **Admin**:  
   - Logs in → Views PostHog analytics → Manages appointments (approve/cancel).  

---  

## 5. UI/UX Guidelines  
- **Theme**: Tailwind `slate` (primary) + `emerald` (accent).  
- **ShadCN Components**:  
  - Booking form: `<Form>`, `<Calendar>`, `<Select>` for service types.  
  - Dashboard: `<Card>`, `<Table>`, `<LineChart>` (PostHog).  
- **Responsive**: Mobile-first, 3-column grid on desktop for services.  

---  

## 6. Technical Implementation  
### Auth  
```tsx 
// auth/[...nextauth]/route.ts  
import NextAuth from "next-auth";  
import { SupabaseAdapter } from "@auth/supabase-adapter";  

export const { handlers, auth } = NextAuth({  
  adapter: SupabaseAdapter(),  
  providers: [/* Google, GitHub, Email */],  
});  
```  

### Bookings  
```tsx 
// app/api/bookings/route.ts (Server Action)  
import { createClient } from "@supabase/supabase-js";  

export async function POST(req: Request) {  
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);  
  const { userId, serviceType } = await req.json();  
  await supabase.from("appointments").insert({ userId, serviceType, status: "pending" });  
}  
```  

### Stripe Checkout  
```tsx 
// components/CheckoutButton.tsx  
import { loadStripe } from "@stripe/stripe-js";  

const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY!);  

export function CheckoutButton({ serviceId }: { serviceId: string }) {  
  const handleClick = async () => {  
    const stripe = await stripePromise;  
    await stripe.redirectToCheckout({ sessionId: await createStripeSession(serviceId) });  
  };  
  return <Button onClick={handleClick}>Book Now</Button>;  
}  
```  

---  

## 7. Development Setup  
1. **Tools**:  
   - Node.js 18+, VSCode, Supabase CLI, Stripe CLI (webhooks).  
2. **Env Variables**:  
   ```env  
   NEXT_PUBLIC_SUPABASE_URL=xxx  
   NEXT_PUBLIC_SUPABASE_KEY=xxx  
   STRIPE_SECRET_KEY=xxx  
   RESEND_API_KEY=xxx  
   ```  
3. **Commands**:  
   ```bash  
   npx create-next-app@latest --tailwind --eslint  
   npx shadcn-ui@latest init  
   npx supabase login  
   ```  

---  

**Strict Adherence**: This blueprint exclusively uses the specified stack. No alternate libraries (e.g., Material UI) are permitted.