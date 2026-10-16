# KUENEREE API

**kueneree** (дэлгүүр) болон **kueneere-admin** (удирдлага / маркетингийн самбар)-д зориулсан GraphQL back-end.

`khurd-api-master`-ийн бүтэц, технологийг яг хэвээр нь авч, зөвхөн энэ хоёр frontend-д хэрэгтэй хэсгийг үлдээсэн:

| | khurd-api | kueneere-api |
|---|---|---|
| Framework | NestJS 11 + Apollo GraphQL (code-first) | ✅ ижил |
| ORM / DB | TypeORM + MySQL 8, SnakeNamingStrategy, migrations | ✅ ижил |
| CRUD | `@ptc-org/nestjs-query` (CRUDResolver) | ✅ ижил (гэхдээ бичих эрхийг guard-аар хамгаалсан) |
| Auth | JWT access/refresh, passport-jwt, bcrypt, roles | ✅ имэйл нэвтрэлт + admin нэвтрэлт |
| Төлбөр / файл | QPay, AWS S3 presigned upload | ✅ ижил |
| Env шалгалт, error filter, logging interceptor, query depth/complexity limit | | ✅ ижил |
| Хасагдсан | parcel, delivery, driver, attendance, sms/OTP, OTAPI sync, BullMQ/Redis, post/comment/tag, website, хот/дүүргийн хүснэгт, wishlist, CASL/rbac | — |
| Шинээр нэмэгдсэн | — | зочин сагс (cartToken), барааны хэмжээ/өнгө variant + үлдэгдэл, newsletter, маркетингийн модуль (campaign, asset, audience, budget, analytics) |

> Redis хэрэггүй болсон тул Docker-т зөвхөн **API + MySQL** ажиллана.

---

## 1. Хурдан эхлэх

Docker-ийн дэлгэрэнгүй заавар → **[DOCKER.md](./DOCKER.md)**

```bash
# A) Хөгжүүлэлт: MySQL-г Docker-т, API-г локалаар (hot reload)
docker compose -f docker-compose.dev.yml up -d
npm install
npm run start:dev          # migration автоматаар ажиллана (RUN_MIGRATIONS_ON_BOOT=true)
npm run seed               # админ + 4 бараа + маркетингийн demo өгөгдөл

# B) Бүгдийг Docker-т
docker compose --env-file .env.production up -d --build
docker compose --env-file .env.production exec api node dist/database/seeds/run-seed.js
```

- GraphQL: `http://localhost:3003/graphql` (development-д Apollo Sandbox нээгдэнэ)
- Health: `http://localhost:3003/health`
- Анхны админ: `.env.*` доторх `ADMIN_EMAIL` / `ADMIN_PASSWORD`

---

## 2. Бүтэц

```
kueneere-api/
├── Dockerfile                  # multi-stage production image
├── docker-compose.yml          # API + MySQL (+ adminer --profile tools)
├── docker-compose.dev.yml      # зөвхөн MySQL + adminer (хөгжүүлэлт)
├── Makefile                    # make up / seed / logs / down ...
├── .env.example                # бүх хувьсагчийн тайлбартай загвар
├── .env.development            # локал (git-д орохгүй)
├── .env.production             # Docker (нууц утгууд автоматаар үүсгэгдсэн, git-д орохгүй)
├── scripts/grant-admin.ts      # хэрэглэгчид эрх олгох
└── src/
    ├── main.ts                 # bootstrap, helmet, CORS, ValidationPipe, migrations on boot
    ├── app.module.ts           # GraphQL, TypeORM, depth/complexity limit
    ├── schema.gql              # автоматаар үүсдэг GraphQL schema (frontend codegen-д)
    ├── config/                 # app, database, jwt, graphql, env.validation (Joi)
    ├── common/                 # guards, decorators, filters, interceptors, utils, jwt service
    ├── database/
    │   ├── data-source.ts      # TypeORM CLI
    │   ├── migrations/         # InitSchema
    │   └── seeds/              # run-seed.ts, seed-data.ts
    └── modules/
        ├── auth/               # register, login, adminLogin, refreshToken, me, createStaff
        ├── user/               # хэрэглэгчийн удирдлага (admin)
        ├── catalog/            # category, product, variant, product image + storefront query
        ├── order/              # сагс (guest/user), checkout, захиалга, статус
        ├── payment/            # QPay invoice, callback, payment түүх
        ├── newsletter/         # имэйл бүртгэл
        ├── marketing/          # campaign, asset, audience, budget, analytics
        ├── look/               # Shop the Look (зураг + цэг x/y %, багц хямдрал)
        ├── content/            # сайтын контент (hero баннер, ticker, campaign …)
        └── upload/             # S3 presigned upload
```

---

## 3. Эрхүүд (roles)

| Role | Хаана | Эрх |
|---|---|---|
| `admin` | admin самбар | бүгд |
| `manager` | admin самбар | бараа, ангилал, захиалга (бичих); бусдыг унших |
| `marketer` | admin самбар | кампанит ажил, asset, audience, төсөв (бичих); бусдыг унших |
| `user` | kueneree | өөрийн профайл, сагс, захиалга |

Ажилтан нэмэх: `createStaff` mutation (admin) эсвэл `npm run script:grant-admin -- email@x.mn marketer`.

---

## 4. API — kueneree (дэлгүүр)

Нэвтрэлт шаардахгүй (зочин). Нэвтэрсэн бол `Authorization: Bearer <accessToken>` илгээнэ.

| Хуудас / үйлдэл | GraphQL |
|---|---|
| Нүүр — бараанууд | `storeProducts(filter: { featured: true })` |
| Ангиллын жагсаалт | `storeCategories` |
| Ангиллаар шүүх / хайх | `storeProducts(filter: { categorySlug: "tops", search: "hoodie" })` |
| Барааны хуудас `/products/[slug]` | `storeProduct(slug: "heavy-zip-hoodie")` |
| Complete the look | `storeRelatedProducts(productId: 2)` |
| Сагсанд нэмэх | `addToCart(input: { productId, variantId, quantity, cartToken })` |
| Сагс харах | `cart(cartToken)` |
| Тоо өөрчлөх / хасах | `updateCartItem`, `removeFromCart` |
| Checkout + QPay | `completeCheckout(input: { cartToken, customerName, email, phone, district, addressLine ... })` |
| Төлбөр шалгах | `checkQPayPayment(invoiceId)` |
| Захиалга шалгах | `trackOrder(input: { number, email })` |
| Newsletter | `subscribeNewsletter(input: { email, locale: "mn" })` |
| Shop the Look | `storeLooks { title imageUrl imageWidth imageHeight pricing { total discount bundlePrice } items { x y product { … } } }` |
| Бүтэн лук сагслах | `addLookToCart(input: { lookId, items: [{ productId, variantId }], cartToken })` — бүх бараа сагсанд байвал `discountTotal` автоматаар |
| Баннер / текст | `siteContent` (hero, ticker, campaign, community, newsletter) |
| Бүртгэл / нэвтрэх | `register`, `login`, `refreshToken`, `me`, `updateProfile`, `changePassword`, `mergeCart`, `myOrders` |

**Зочин сагс:** анхны `addToCart`-ийн хариуны `cartToken`-ийг `localStorage`-д хадгалаад дараагийн бүх сагсны дуудлагад дамжуулна. Нэвтэрсний дараа `mergeCart(cartToken)` дуудаж нийлүүлнэ.

**Хүргэлт:** `itemTotal >= FREE_DELIVERY_THRESHOLD` (150,000₮) бол үнэгүй, бусад үед `DELIVERY_FEE` (6,000₮).

**Олон хэл:** `product.translations` / `category.translations` = `{ en: { name, color, fitNote, ... }, ko: {...} }`. Үндсэн (`name` г.м) талбар нь монгол.

```graphql
query Home {
  storeProducts(filter: { featured: true, limit: 8 }) {
    total
    items {
      id slug name price color mainImage translations
      category { slug name }
      variants { id size stock }
    }
  }
}
```

## 5. API — kueneere-admin

Эхлээд `adminLogin(input: { email, password })` → `accessToken`.

| Admin хуудас | GraphQL |
|---|---|
| Pulse (`/`) | `marketingMetrics`, `campaigns`, `storeOverview`, `dailyRevenue(days: 30)` |
| Architect (`/architect`, Gantt) | `campaigns { startDate endDate progress status }`, `createOneCampaign`, `updateOneCampaign`, `deleteOneCampaign`, `toggleCampaignStatus(id)` |
| Engine (`/analytics`) | `channelPerformance`, `marketingMetrics` |
| Vault (`/assets`) | `campaignAssets`, `createOneCampaignAsset`, `deleteOneCampaignAsset`, `getPresignedUploadUrl(input: { filename, mimeType, folder: "assets" })` |
| Intel (`/audience`) | `audienceSegments`, `createOneAudienceSegment`, ... , `newsletterSubscribers` |
| Budget (`/budget`) | `budgetOverview`, `updateBudgetSettings`, `topUpBudget`, `recordSpend`, `channelBudgets`, `updateOneChannelBudget` |
| Settings (`/settings`) | `me`, `updateProfile`, `changePassword`, `users`, `createStaff`, `updateOneUser` |
| Products (`/products`) | `products`, **`saveProduct(input)`** — бараа + зураг + хэмжээ/үлдэгдлийг нэг дор, `updateOneProduct` (төлөв), `deleteOneProduct`, `categories`, `createOneCategory` … |
| Зураг оруулах | `POST /uploads` (multipart: `file`, `folder`) — S3 тохируулсан бол S3, үгүй бол серверийн `uploads/` хавтас → `http://localhost:3003/uploads/...` |
| Захиалга | `orders(filter: { status: { neq: BASKET } })`, `updateOrderStatus`, `payments` |
| Лук (`/looks`) | `looks`, `saveLook(input: { title, translations, imageUrl, imageWidth, imageHeight, bundleDiscountPercent, isPublished, items: [{ productId, x, y }] })`, `deleteLook`, `reorderLooks` |
| Контент (`/content`) | `siteContent`, `updateSiteContent(key, data)` |

nestjs-query жагсаалтууд `paging: { limit, offset }`, `filter`, `sorting`, `totalCount`-той:

```graphql
query Campaigns {
  campaigns(
    paging: { limit: 20 }
    filter: { status: { in: [LIVE, PAUSED] } }
    sorting: [{ field: updatedAt, direction: DESC }]
  ) {
    totalCount
    nodes { id name status channel budget spend impressions progress roas updatedAt }
  }
}
```

---

## 6. Frontend-уудтай холбох

| Төсөл | Порт | `.env.local` |
|---|---|---|
| `kueneere-api` | 3003 | (`.env.development`) |
| `kueneree` (дэлгүүр) | 3000 | `NEXT_PUBLIC_API_URL=http://localhost:3003/graphql` |
| `kueneere-admin` | 3001 | `NEXT_PUBLIC_API_URL=http://localhost:3003/graphql`, `NEXT_PUBLIC_STORE_URL=http://localhost:3000` |

```bash
# 3 terminal:
cd kueneere-api   && npm run start:dev
cd kueneree       && npm install && npm run dev                 # :3000
cd kueneere-admin && npm install && npx next dev -p 3001        # :3001  (.npmrc → legacy-peer-deps)
```

Admin-д `.env`-ийн `ADMIN_EMAIL` / `ADMIN_PASSWORD`-оор нэвтэрнэ. Seed-ийн зургууд (`/images/khulan/...`) нь kueneree-ийн `public/` хавтаснаас ачаалагддаг тул admin-д зураг харагдахын тулд kueneree асаалттай байх хэрэгтэй.

## 7. npm scripts

| Script | Тайлбар |
|---|---|
| `npm run start:dev` | hot-reload хөгжүүлэлт |
| `npm run build` / `start:prod` | production build / ажиллуулах |
| `npm run migration:generate -- src/database/migrations/Name` | entity өөрчлөлтөөс migration үүсгэх |
| `npm run migration:run` / `migration:revert` / `migration:show` | migration удирдах |
| `npm run seed` / `seed:prod` | анхны өгөгдөл (`SEED_DEMO=false` → зөвхөн админ + ангилал) |
| `npm run script:grant-admin -- email [role]` | эрх олгох |
| `npm test`, `npm run lint` | тест, lint |
# kueneere-api
