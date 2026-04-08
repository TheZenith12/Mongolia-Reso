# 🌿 Монгол Нутаг — Resort & Nature Platform

Монгол Улсын амралтын газрууд болон байгалийн үзэсгэлэнт газруудын нэгдсэн Full-Stack платформ.

---

## 🛠 Технологийн стек

| Давхарга | Технологи |
|---------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | Tailwind CSS + Custom Design System |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth |
| Media | Cloudinary |
| Payments | QPay + Stripe |
| Deploy | Vercel |

---

## 🚀 Эхлүүлэх

### 1. Repository clone хийх

```bash
git clone https://github.com/your-org/mongolian-resorts.git
cd mongolian-resorts
npm install
```

### 2. Environment variables тохируулах

```bash
cp .env.example .env.local
```

`.env.local` файлд дараах утгуудыг бөглөнө:

```env
# Supabase — https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudinary — https://cloudinary.com/console
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Stripe — https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# QPay — QPay merchant dashboard-аас авна
QPAY_USERNAME=
QPAY_PASSWORD=
QPAY_INVOICE_CODE=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase database тохируулах

1. [supabase.com](https://supabase.com) дээр шинэ project үүсгэнэ
2. SQL Editor → `supabase/schema.sql` файлыг ажиллуулна
3. Authentication → Settings → Site URL-ийг тохируулна

### 4. Cloudinary Upload Preset үүсгэх

1. Cloudinary dashboard → Settings → Upload
2. "Add upload preset" → Unsigned → Name: `mongolian_resorts`

### 5. Development эхлүүлэх

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) дээр нээнэ.

---

## 📁 Файлын бүтэц

```
mongolian-resorts/
├── app/
│   ├── (public)/              # Public routes (нүүр, газрууд, захиалга)
│   │   ├── page.tsx           # Нүүр хуудас
│   │   ├── places/            # Газруудын жагсаалт, дэлгэрэнгүй
│   │   ├── booking/           # Захиалга, төлбөр, баталгаажуулалт
│   │   └── profile/           # Хэрэглэгчийн профайл
│   ├── admin/                 # Admin хэсэг
│   │   ├── page.tsx           # Dashboard
│   │   ├── places/            # Газрууд удирдах
│   │   ├── bookings/          # Захиалгууд
│   │   └── users/             # Хэрэглэгчид (super admin)
│   ├── auth/                  # Login, Register
│   └── api/                   # API routes
│       ├── payment/           # QPay, Stripe
│       ├── upload/            # Cloudinary
│       └── admin/             # Admin API
├── components/
│   ├── layout/                # Header, Footer
│   ├── home/                  # Нүүр хуудасны компонентууд
│   ├── places/                # Газрын компонентууд
│   ├── booking/               # Захиалгын компонентууд
│   ├── auth/                  # Нэвтрэх форм
│   └── admin/                 # Admin компонентууд
├── lib/
│   ├── actions/               # Server Actions
│   ├── supabase.ts            # Supabase client
│   ├── types.ts               # TypeScript types
│   └── utils.ts               # Helper functions
└── supabase/
    └── schema.sql             # Database schema
```

---

## 🔐 Эрхийн систем

| Эрх | Чадавхи |
|-----|---------|
| **Super Admin** | Бүх мэдээлэл, хэрэглэгчдийн эрх тохируулах |
| **Manager** | Өөрийн газрын мэдээлэл засах, захиалгууд харах |
| **User** | Захиалга хийх, сэтгэгдэл үлдээх, хадгалах |
| **Guest** | Газруудыг харах, хайх |

### Super Admin үүсгэх

```sql
-- Supabase SQL Editor дээр ажиллуулна
UPDATE profiles SET role = 'super_admin' WHERE id = 'your-user-uuid';
```

---

## 💳 Төлбөрийн систем

### QPay
- Монгол банкнуудтай нэгтгэгдсэн
- QR кодоор төлөх
- `QPAY_USERNAME`, `QPAY_PASSWORD`, `QPAY_INVOICE_CODE` шаардлагатай

### Stripe
- Олон улсын карт (Visa, MC, Amex)
- Webhook endpoint: `/api/payment/stripe/webhook`
- Stripe CLI: `stripe listen --forward-to localhost:3000/api/payment/stripe/webhook`

---

## 🌐 Deploy (Vercel)

```bash
# Vercel CLI
npm i -g vercel
vercel --prod
```

Environment variables-ийг Vercel dashboard дээр тохируулна.

---

## 📝 API Endpoints

| Endpoint | Method | Тайлбар |
|---------|--------|---------|
| `/api/payment/qpay` | POST | QPay invoice үүсгэх |
| `/api/payment/qpay/check` | GET | Төлбөр шалгах |
| `/api/payment/stripe` | POST | Stripe checkout session |
| `/api/payment/stripe/webhook` | POST | Stripe webhook |
| `/api/upload` | POST | Зураг upload хийх |
| `/api/admin/users/role` | POST | Хэрэглэгчийн эрх өөрчлөх |

---

## 🧑‍💻 Хөгжүүлэлт

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Build test
npm run build
```
