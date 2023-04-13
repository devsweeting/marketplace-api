ENV ?= staging
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
	docker build -f Dockerfile.ecs -t api .

.PHONY : tag-test
tag-test: ## Add test tag to current HEAD and push tag remotely
	@echo "This might fail if your local changes have not been pushed remotely"
	git tag -f test && git push -f origin --tags

.PHONY : ecr
ecr: ## Build new container image and push to ECR
	export AWS_PROFILE=jump${ENV}
	docker build --platform=linux/amd64 -f Dockerfile.ecs -t api-${ENV} .
	docker tag api-${ENV}:latest ${ACCOUNT_ID}.dkr.ecr.us-west-2.amazonaws.com/api-${ENV}:latest
	aws ecr get-login-password --profile jump${ENV} --region us-west-2 | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.us-west-2.amazonaws.com
	docker push ${ACCOUNT_ID}.dkr.ecr.us-west-2.amazonaws.com/api-${ENV}:latest

.PHONY : deploy
deploy: ecr ## Build new container image, push to ECR and deploy to ECS
	export AWS_PROFILE=jump${ENV}
	aws ecs update-service --cluster jumpco-cluster-${ENV} --service api-${ENV} --force-new-deployment
