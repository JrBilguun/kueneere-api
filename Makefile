# KUENEERE API — Docker товчлол
#   make up       бүтэн stack асаах (build хийнэ)
#   make seed     анхны өгөгдөл (админ, бараа, маркетинг demo)
#   make logs     API log харах
#   make down     зогсоох (өгөгдөл хадгалагдана)
#   make reset    зогсоож DB-г БҮР устгах (болгоомжтой!)
#   make dev-db   хөгжүүлэлтийн MySQL асаах (API-г npm run start:dev-ээр)

ENV_FILE ?= .env.production
COMPOSE  = docker compose --env-file $(ENV_FILE)

.PHONY: up down logs seed ps restart shell db reset dev-db dev-db-down

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart api

logs:
	$(COMPOSE) logs -f api

ps:
	$(COMPOSE) ps

seed:
	$(COMPOSE) exec api node dist/database/seeds/run-seed.js

shell:
	$(COMPOSE) exec api sh

db:
	$(COMPOSE) exec mysql sh -c 'mysql -u$$MYSQL_USER -p$$MYSQL_PASSWORD $$MYSQL_DATABASE'

reset:
	$(COMPOSE) down -v

dev-db:
	docker compose -f docker-compose.dev.yml up -d

dev-db-down:
	docker compose -f docker-compose.dev.yml down
