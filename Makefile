ENV ?= test
ACCOUNT_ID = $(shell aws --profile jump${ENV} sts get-caller-identity --query "Account" --output text)

.PHONY : help
help: # Display help
	@awk -F ':|##' \
		'/^[^\t].+?:.*?##/ {\
			printf "\033[36m%-30s\033[0m %s\n", $$1, $$NF \
		}' $(MAKEFILE_LIST)

.PHONY : env
env: ## Echo out environment
	@echo $(ENV)

.PHONY : build
build: ## Build docker image locally
	docker build -t api .

.PHONY : dc
dc: ## Run docker compose locally
	docker-compose up -d

.PHONY : ecr
ecr: ## Build new container image and push to ECR
	docker build --platform=linux/amd64 -f Dockerfile.ecs -t api-${ENV} .
	docker tag api-${ENV}:latest ${ACCOUNT_ID}.dkr.ecr.us-west-2.amazonaws.com/api-${ENV}:latest
	aws ecr get-login-password --profile jump${ENV} --region us-west-2 | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.us-west-2.amazonaws.com
	docker push ${ACCOUNT_ID}.dkr.ecr.us-west-2.amazonaws.com/api-${ENV}:latest