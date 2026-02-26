#!/bin/bash

# 1. Variables (Update these if they change)
AWS_ACCOUNT_ID="339713165006"
REGION="us-east-1"
ECR_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

echo "🚀 Starting Deployment Process..."

# 2. Login to ECR
echo "🔑 Logging into AWS ECR..."
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ECR_URL}

# 3. Build, Tag, and Push BACKEND
echo "📦 Processing BACKEND..."
docker build -f Dockerfile.backend -t mernecommerce-backend .
docker tag mernecommerce-backend:latest ${ECR_URL}/mernecommerce-backend:latest
docker push ${ECR_URL}/mernecommerce-backend:latest

# 4. Build, Tag, and Push FRONTEND
echo "📦 Processing FRONTEND..."
docker build -f Dockerfile.frontend -t mernecommerce-frontend .
docker tag mernecommerce-frontend:latest ${ECR_URL}/mernecommerce-frontend:latest
docker push ${ECR_URL}/mernecommerce-frontend:latest

echo "✅ All images pushed to ECR! Now SSH into your EC2 and pull the updates."

