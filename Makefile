.PHONY: dev dev-stop fresh seed test docker-up docker-down prod-up prod-down prod-deploy prod-logs prod-fresh prod-ssl prod-shell

# ===========================================
# EventFlow SaaS - Development Commands
# ===========================================

# --- Local Development (sin Docker) ---

dev: ## Start local dev servers (Laravel + Vite)
	@echo "Starting EventFlow dev servers..."
	@cd backend && php artisan serve --port=8000 & \
	cd backend && npm run dev & \
	echo "\n  App:   http://localhost:8000" && \
	echo "  Vite:  http://localhost:5173\n" && \
	echo "  Login: admin@eventflow.app / password\n" && \
	wait

dev-stop: ## Stop all dev servers
	@lsof -ti:8000 -ti:5173 | xargs kill 2>/dev/null || true
	@echo "Dev servers stopped."

fresh: ## Fresh migrate + seed
	@cd backend && php artisan migrate:fresh --seed

seed: ## Run seeders only
	@cd backend && php artisan db:seed

test: ## Run tests
	@cd backend && php artisan test

# --- Docker ---

docker-up: ## Start Docker stack
	@cp backend/.env.docker backend/.env
	@docker compose up -d
	@echo "Waiting for services..."
	@sleep 5
	@docker compose exec app php artisan migrate --seed
	@echo "\n  App:     http://localhost"
	@echo "  Mailpit: http://localhost:8025"
	@echo "  MinIO:   http://localhost:9001\n"

docker-down: ## Stop Docker stack
	@docker compose down

docker-fresh: ## Fresh migrate + seed in Docker
	@docker compose exec app php artisan migrate:fresh --seed

# --- Production (DigitalOcean) ---

prod-up: ## Start production stack
	@docker compose -f docker-compose.prod.yml up -d
	@echo "\n  App running at https://ec-central-1.console.awscommunity.ec\n"

prod-down: ## Stop production stack
	@docker compose -f docker-compose.prod.yml down

prod-deploy: ## Full deploy: pull, rebuild, restart
	@git pull origin main
	@docker compose -f docker-compose.prod.yml up -d --build app scheduler
	@docker restart eventflow-nginx
	@echo "Waiting for app to be ready..."
	@sleep 5
	@docker logs eventflow-app --tail 15
	@echo "\n  Deploy completed!\n"

prod-logs: ## View production logs
	@docker compose -f docker-compose.prod.yml logs -f --tail=100

prod-fresh: ## Fresh migrate + seed in production (DESTRUCTIVE)
	@echo "WARNING: This will destroy all data!"
	@read -p "Are you sure? (y/N) " confirm && [ "$$confirm" = "y" ] || exit 1
	@docker compose -f docker-compose.prod.yml exec -T app php artisan migrate:fresh --seed --force

prod-ssl: ## Renew SSL certificate
	@docker compose -f docker-compose.prod.yml exec -T certbot certbot renew --quiet
	@docker compose -f docker-compose.prod.yml exec -T nginx nginx -s reload
	@echo "SSL certificate renewed."

prod-shell: ## Open shell in app container
	@docker compose -f docker-compose.prod.yml exec app bash

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'
