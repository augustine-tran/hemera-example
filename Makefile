NAME = Prada20BE
VERSION = 1.0
CUR_DIR = $(shell basename $(CURDIR))

.PHONY: start dev_up composer bower dbmigrate

dev_up:
	docker-compose up -d --remove-orphans

staging:
	docker-compose -f docker-compose-staging.yml up -d --remove-orphans
ps:
	docker-compose ps

fuge:
	docker-compose exec fuge fuge shell fuge/fuge.yml

ssh:
	docker-compose exec fuge /bin/bash

run-sonar:
	chmod +x scripts/sonar-scanner.sh && ./scripts/sonar-scanner.sh
	
notify:
	chmod +x scripts/notify.sh && ./scripts/notify.sh

dbmigrate-generate:
	docker-compose exec prada-adminer doctrine-migrations migrations:generate

dbmigrate:
	docker-compose exec prada-adminer doctrine-migrations migrations:migrate -n

dbmigrate-down:
	docker-compose exec prada-adminer doctrine-migrations migrations:migrate prev -n

down:
	docker-compose down

staging-down:
	docker-compose -f docker-compose-staging.yml down	
