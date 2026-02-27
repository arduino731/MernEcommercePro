#!/bin/bash

# Load variables from your .env file so the script can use them
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# 1. Variables (Update these if they change)
AWS_ACCOUNT_ID="339713165006"
REGION="us-east-1"
ECR_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

# Make sure this matches your current Cancún/AWS IP!
EC2_IP="34.207.221.50" 
KEY_PATH="~/.ssh/mernEcommercePro-key.pem"

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

# 5. SSH into EC2 and update the live server!
echo "☁️ Phase 2: Remotely updating EC2 at ${EC2_IP}..."

ssh -i "${KEY_PATH}" ec2-user@"${EC2_IP}" << EOF
  # Login to ECR on the server
  aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ECR_URL}

  # Pull the fresh image you just built
  docker pull ${ECR_URL}/mernecommerce-backend:latest

  # Clear out the old container
  docker rm -f mernecommerce-backend || true

  # Start the new one with Production Mode and Port 80
  docker run -d \
    --name mernecommerce-backend \
    -p 80:5000 \
    -e NODE_ENV="${NODE_ENV}" \
    -e MONGODB_URI="${MONGODB_URI}" \
    --restart always \
    ${ECR_URL}/mernecommerce-backend:latest
  
  echo "✨ EC2 Update Complete!"
EOF

echo "✅ All done! The new version is live."