# Docker тохиргоо — алхам алхмаар

Энэ заавар `kueneere-api`-г Docker ашиглан **(A) хөгжүүлэлтийн** болон **(B) бүтэн production** горимд ажиллуулахыг нэг бүрчлэн тайлбарлана. Mac (таны компьютер) дээр туршсан командууд.

---

## 0. Ойлголтууд (2 минут)

| Нэр томьёо | Юу гэсэн үг |
|---|---|
| **Image** | Апп + Node.js + dependency-г багтаасан "загвар" (жишээ: `kueneere-api:latest`, `mysql:8.0`). `Dockerfile`-аас **build** хийж үүсгэнэ. |
| **Container** | Image-аас асаасан ажиллаж буй процесс. Унтрааж/асааж, устгаж болно. |
| **Volume** | Container устсан ч хадгалагдах өгөгдөл (манайд MySQL-ийн DB файлууд: `mysql_data`). |
| **Docker Compose** | Олон container-ийг (API + MySQL) нэг файлаар (`docker-compose.yml`) тодорхойлж, нэг командаар асаах хэрэгсэл. |
| **Port mapping** `3003:3003` | Компьютерийн 3003 порт → container-ийн 3003 порт. |

Манай бүтэц:

```
 ┌──────────── таны Mac ─────────────────────────────────────┐
 │  kueneree (Next.js :3000)    kueneere-admin (Next.js :3001) │
 │            │  GraphQL             │                         │
 │            ▼                      ▼                         │
 │   ┌──────── Docker network "kueneere" ───────────┐          │
 │   │  api  (kueneere-api :3003) ──► mysql (:3306) │          │
 │   │                                  │ volume    │          │
 │   └──────────────────────────────────┴──────────┘          │
 └────────────────────────────────────────────────────────────┘
```

---

## 1. Docker Desktop суулгах

1. https://www.docker.com/products/docker-desktop/ → **Download for Mac** — өөрийн чипээ сонгоно:
   - **Apple Silicon** (M1/M2/M3/M4) эсвэл **Intel**. Мэдэхгүй бол:  → About This Mac → *Chip*.
2. `.dmg`-г нээж **Docker.app**-г *Applications* руу чирнэ → асаана.
3. Дээд цэсэнд 🐳 халим гарч ирээд "Docker Desktop is running" болохыг хүлээнэ.
4. Terminal нээгээд шалгана:

```bash
docker --version          # Docker version 2x.x.x ...
docker compose version    # Docker Compose version v2.x.x
docker run --rm hello-world
```

`Hello from Docker!` гарвал бэлэн.

> **Тохиргоо (заавал биш):** Docker Desktop → Settings → Resources → Memory-г **4 GB+** болговол build хурдан.

---

## 2. Төслийн Docker файлууд

```
kueneere-api/
├── Dockerfile               ← API-ийн image хэрхэн build хийгдэх
├── .dockerignore            ← image руу ОРУУЛАХГҮЙ файлууд (node_modules, .env ...)
├── docker-compose.yml       ← (B) API + MySQL бүтэн stack
├── docker-compose.dev.yml   ← (A) зөвхөн MySQL + Adminer
├── .env.example             ← бүх хувьсагчийн загвар (тайлбартай)
├── .env.development         ← (A) локал API-д
├── .env.production          ← (B) Docker API-д (нууц утгууд аль хэдийн үүсгэгдсэн)
└── Makefile                 ← богино командууд (make up, make seed ...)
```

### Dockerfile — 4 үе шат (multi-stage)

| Stage | Юу хийдэг | Яагаад |
|---|---|---|
| `deps` | `npm ci` — бүх dependency, bcrypt-д зориулж `python3 make g++` | build хийхэд TypeScript, Nest CLI хэрэгтэй |
| `build` | `nest build` → `dist/` | TypeScript-ийг JavaScript болгоно |
| `prod-deps` | `npm prune --omit=dev` | devDependency-г хасаж image-ийг жижигрүүлнэ |
| `runtime` | зөвхөн `dist/` + prod `node_modules`, `USER node`, `HEALTHCHECK /health` | жижиг, root биш, аюулгүй |

Container асахад `RUN_MIGRATIONS_ON_BOOT=true` тул **migration автоматаар** ажиллаж хүснэгтүүд үүснэ.

---

## 3. (A) Хөгжүүлэлтийн горим — MySQL Docker-т, API локалаар

Код өөрчлөх бүрт API автоматаар дахин асна (hot reload). Өдөр тутам ингэж ажиллахыг зөвлөж байна.

**Шаардлага:** Node.js 20+ (`node -v`).

```bash
cd ~/Desktop/Khulan-ecom/kueneere-api

# 1) MySQL + Adminer асаах
docker compose -f docker-compose.dev.yml up -d

# 2) MySQL бэлэн болохыг шалгах — STATUS дээр (healthy) гартал 20-30 сек хүлээнэ
docker compose -f docker-compose.dev.yml ps

# 3) Dependency суулгах (анх удаа)
npm install

# 4) API асаах — анх асахдаа migration ажиллаж бүх хүснэгт үүснэ
npm run start:dev
#   ... Application is running on: http://0.0.0.0:3003

# 5) Шинэ terminal-д: анхны өгөгдөл (админ, 5 ангилал, 4 бараа, маркетингийн demo)
npm run seed
```

Шалгах:

- http://localhost:3003/health → `{"status":"ok"}`
- http://localhost:3003/graphql → Apollo Sandbox. Дараахыг ажиллуулна:
  ```graphql
  { storeProducts { total items { name price } } }
  ```
- http://localhost:8080 → **Adminer** (DB-г вэбээр харах)
  System: `MySQL`, Server: `mysql`, Username: `kueneere`, Password: `kueneere`, Database: `kueneere_db`

Зогсоох:

```bash
# API: terminal дээр Ctrl + C
docker compose -f docker-compose.dev.yml down        # MySQL зогсоох (өгөгдөл хадгалагдана)
docker compose -f docker-compose.dev.yml down -v     # өгөгдлийг БҮР устгах (шинээр эхлэх)
```

---

## 4. (B) Production горим — API + MySQL хоёулаа Docker-т

Серверт байршуулахтай яг адил орчин. Frontend-үүдийг жинхэнэ API-тай туршихад тохиромжтой.

### 4.1 `.env.production`-ийг шалгах

Файл аль хэдийн бэлэн (JWT, DB нууц үгс санамсаргүйгээр үүсгэгдсэн). Нээгээд дараахыг хараарай:

```bash
open -e .env.production
```

| Хувьсагч | Утга / тайлбар |
|---|---|
| `DB_HOST=mysql` | compose доторх service-ийн нэр (compose өөрөө ч тохируулдаг) |
| `DB_PASSWORD`, `DB_ROOT_PASSWORD` | MySQL анх асахад эдгээрээр хэрэглэгч үүснэ. **Дараа нь солибол** → 9-р хэсгийн "Access denied"-г үз |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | ≥32 тэмдэгт. Солибол бүх хэрэглэгч дахин нэвтэрнэ |
| `CORS_ORIGINS` | frontend-үүдийн хаяг, таслалаар: `http://localhost:3000,http://localhost:3001` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | seed хийхэд үүсэх анхны админ |
| `QPAY_*`, `AWS_S3_*` | хоосон бол тухайн функц л ажиллахгүй, апп асна |

### 4.2 Build хийж асаах

```bash
cd ~/Desktop/Khulan-ecom/kueneere-api

docker compose --env-file .env.production up -d --build
#  ✔ Container kueneere-mysql  Healthy
#  ✔ Container kueneere-api    Started
```

> `--env-file .env.production` нь compose файл доторх `${DB_PASSWORD}` гэх мэт утгыг бөглөнө. Мартвал
> `DB_PASSWORD .env.production-д заавал` гэсэн алдаа гарна. **Makefile ашиглавал энийг бичих шаардлагагүй:** `make up`.

Анх удаа build ~2-4 минут (image татах + npm ci). Дараагийнх нь cache-аас хурдан.

### 4.3 Төлөв, log шалгах

```bash
docker compose --env-file .env.production ps
# NAME             STATUS
# kueneere-api     Up 1 minute (healthy)
# kueneere-mysql   Up 1 minute (healthy)

docker compose --env-file .env.production logs -f api     # Ctrl+C гарах
#  [Bootstrap] Running pending migrations...
#  [Bootstrap] All migrations completed successfully
#  [Bootstrap] Application is running on: http://0.0.0.0:3003
```

### 4.4 Анхны өгөгдөл (seed)

```bash
docker compose --env-file .env.production exec api node dist/database/seeds/run-seed.js
#  ✓ admin user: admin@kueneere.mn
#  ✓ 5 categories
#  ✓ 4 products (with variants & images)
#  ...
```

Давтаж ажиллуулсан ч давхардахгүй. Зөвхөн админ + ангилал (demo-гүй) хүсвэл:
`docker compose --env-file .env.production exec -e SEED_DEMO=false api node dist/database/seeds/run-seed.js`

### 4.5 Туршиж үзэх

```bash
curl http://localhost:3003/health

curl -s http://localhost:3003/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ storeProducts { total items { name price } } }"}'

# Админ нэвтрэх (нууц үгээ .env.production-ий ADMIN_PASSWORD-оос)
curl -s http://localhost:3003/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"mutation { adminLogin(input:{email:\"admin@kueneere.mn\", password:\"<ADMIN_PASSWORD>\"}) { accessToken user { roles } } }"}'
```

> Production горимд `GRAPHQL_PLAYGROUND=false` тул браузераар `/graphql` нээхэд Sandbox гарахгүй (400) — энэ хэвийн. Туршихдаа curl, Postman, Insomnia ашиглана.

### 4.6 DB-г харах (заавал биш)

```bash
# Adminer: http://localhost:8080  (Server: mysql, хэрэглэгч/нууц үг .env.production-оос)
docker compose --env-file .env.production --profile tools up -d adminer

# Эсвэл MySQL console
make db
```

TablePlus / DBeaver-ээр: Host `127.0.0.1`, Port `3306`, User `kueneere`, Password = `DB_PASSWORD`.

---

## 5. Frontend-үүдийг холбох

API нь `http://localhost:3003/graphql` дээр. Хоёр Next.js төсөлд `.env.local` үүсгэнэ:

```bash
# kueneree/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3003/graphql

# kueneere-admin/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3003/graphql
```

Хоёулаа 3000 порт дээр асах гэж оролддог тул admin-ыг 3001 дээр асаана:

```bash
cd ../kueneree        && npm run dev              # http://localhost:3000
cd ../kueneere-admin  && npx next dev -p 3001     # http://localhost:3001
```

Энгийн fetch жишээ (`lib/api.ts`):

```ts
export async function gql<T>(query: string, variables?: object, token?: string): Promise<T> {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}
```

Өөр порт/домэйн дээр frontend асаавал `.env.production`-ий `CORS_ORIGINS`-д нэмээд `make restart` хийнэ.

---

## 6. Өдөр тутмын командууд

| Хийх зүйл | Makefile | Бүтэн команд |
|---|---|---|
| Асаах / дахин build | `make up` | `docker compose --env-file .env.production up -d --build` |
| Зогсоох (өгөгдөл үлдэнэ) | `make down` | `docker compose --env-file .env.production down` |
| API log | `make logs` | `... logs -f api` |
| Төлөв | `make ps` | `... ps` |
| API-г restart (env өөрчилсний дараа) | `make restart` | `... up -d api` *(env өөрчлөгдсөн бол `up -d` хэрэгтэй)* |
| Seed | `make seed` | `... exec api node dist/database/seeds/run-seed.js` |
| Container дотор shell | `make shell` | `... exec api sh` |
| MySQL console | `make db` | `... exec mysql mysql -ukueneere -p kueneere_db` |
| **Бүгдийг устгах (DB орно!)** | `make reset` | `... down -v` |
| Хөгжүүлэлтийн DB | `make dev-db` / `make dev-db-down` | `docker compose -f docker-compose.dev.yml up -d` |

Код өөрчилсний дараа Docker дахь API-г шинэчлэх: **`make up`** (дахин build хийнэ).

> ⚠️ `.env.production`-ийг өөрчилсний дараа `restart` хангалтгүй — container-ийг дахин үүсгэх хэрэгтэй: `make up`.

---

## 7. Шинэ хүснэгт / багана нэмэх (migration)

1. Entity засна (жишээ: `src/modules/catalog/entities/product.entity.ts`-д `material` багана нэмэх).
2. Хөгжүүлэлтийн DB асаалттай байхад:
   ```bash
   npm run migration:generate -- src/database/migrations/AddMaterialToProducts
   ```
3. Үүссэн файлыг шалгаад `npm run start:dev` (автоматаар ажиллана) эсвэл `npm run migration:run`.
4. Docker-т: `make up` — шинэ image асахдаа migration-ийг өөрөө ажиллуулна.

Буцаах: `npm run migration:revert`.

---

## 8. Сервер (VPS) дээр байршуулах

1. Сервер (Ubuntu 22.04/24.04) дээр Docker суулгах:
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER   # дахин login хийнэ
   ```
2. Төслөө хуулах (`git clone` эсвэл `scp -r kueneere-api user@server:~`). **`.env.production`-ийг git-д бүү хий** — серверт тусад нь хуулна.
3. `.env.production` засах:
   ```env
   CORS_ORIGINS=https://kueneree.mn,https://admin.kueneree.mn
   QPAY_CALLBACK_URL=https://api.kueneree.mn/qpay/callback
   GRAPHQL_INTROSPECTION=false
   QPAY_USERNAME=...  QPAY_PASSWORD=...  QPAY_INVOICE_CODE=...
   AWS_S3_ACCESS_KEY=...  AWS_S3_SECRET_KEY=...
   ```
4. Асаах: `docker compose --env-file .env.production up -d --build` → `make seed`.
5. **HTTPS:** API-г шууд интернэтэд бус, Nginx / Caddy reverse proxy-оор гаргана. Caddy жишээ (`/etc/caddy/Caddyfile`):
   ```
   api.kueneree.mn {
     reverse_proxy 127.0.0.1:3003
   }
   ```
   Ингэвэл compose-ийн портыг `"127.0.0.1:3003:3003"` болгож зөвхөн дотроос нээнэ.
6. **Нөөцлөлт (backup)** — өдөр бүр cron-оор:
   ```bash
   docker compose --env-file .env.production exec -T mysql \
     sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" kueneere_db' > backup_$(date +%F).sql
   ```
   Сэргээх: `cat backup.sql | docker compose --env-file .env.production exec -T mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" kueneere_db'`

---

## 9. Түгээмэл алдаа ба шийдэл

| Алдаа | Шалтгаан | Шийдэл |
|---|---|---|
| `Cannot connect to the Docker daemon` | Docker Desktop асаагүй | Docker.app-г асааж 🐳 ногоон болтол хүлээнэ |
| `Bind for 127.0.0.1:3306 failed: port is already allocated` | Mac дээр MySQL (Homebrew) аль хэдийн ажиллаж байна | `brew services stop mysql`, эсвэл `.env.production`-д `DB_EXPOSE_PORT=3307` (dev файлд `"127.0.0.1:3307:3306"` + `.env.development`-д `DB_PORT=3307`) |
| `port 3003 is already allocated` | локал `npm run start:dev` давхар ажиллаж байна | нэгийг нь зогсоох, эсвэл `API_PORT=3005` |
| `DB_PASSWORD .env.production-д заавал` | `--env-file` мартсан | `docker compose --env-file .env.production ...` эсвэл `make up` |
| `Access denied for user 'kueneere'` | volume үүссэний дараа DB нууц үгийг сольсон (MySQL зөвхөн **анх** хэрэглэгч үүсгэдэг) | хуучин нууц үгээ буцааж тавих, эсвэл өгөгдлөө устгаж болох бол `make reset` → `make up` |
| `kueneere-api` нь `(unhealthy)` / дахин дахин restart | env алдаа (жнь `JWT_SECRET` < 32 тэмдэгт) эсвэл DB холбогдохгүй | `make logs` — `Config validation error` эсвэл `ECONNREFUSED` гэх мэт мөрийг хараарай |
| Browser console: `CORS policy` | frontend-ийн хаяг `CORS_ORIGINS`-д алга | нэмээд `make up` |
| `Нэвтрэх мэдээлэл буруу байна` (admin) | seed хийгээгүй эсвэл нууц үг буруу | `make seed`, нууц үгийг `.env.production`-оос |
| `QPay тохируулагдаагүй байна` | `QPAY_*` хоосон | QPay мерчантын мэдээллээ бөглөнө |
| Apple Silicon дээр image удаан / `platform` анхааруулга | — | `node:20-alpine`, `mysql:8.0` хоёулаа arm64-тэй тул хэвийн; Docker Desktop-оо шинэчилнэ |
| Дискний зай дүүрсэн | хуучин image/cache | `docker system prune` (volume-д хүрэхгүй) |
