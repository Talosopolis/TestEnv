#!/bin/bash
set -e

# Configuration
PROJECT_ID=${1:-"talos-dev-480518"}
REGION="us-central1"
REPO_NAME="talosopolis-repo"
BACKEND_SERVICE="talos-backend"
FRONTEND_SERVICE="talos-frontend"

echo "🚀 Deploying Talosopolis FRONTEND ONLY to GCP Project: $PROJECT_ID"

# Get Backend URL (Needed for build arg)
echo "Fetching existing Backend URL..."
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --project $PROJECT_ID --format 'value(status.url)')
echo "Backend URL: $BACKEND_URL"

# Determine Environment
APP_ENV="development"
if [[ "$PROJECT_ID" == "talos-prod-483812" ]]; then
    APP_ENV="production"
fi
echo "🌍 Environment: $APP_ENV"

# Build & Push Frontend
echo "Building Frontend..."
gcloud builds submit services/frontend \
    --config services/frontend/cloudbuild.yaml \
    --substitutions=_VITE_API_URL="$BACKEND_URL",_APP_ENV="$APP_ENV",_REGION="$REGION",_REPO_NAME="$REPO_NAME" \
    --project $PROJECT_ID

# Deploy Frontend (Public)
echo "Deploying Frontend (Public)..."
gcloud run deploy $FRONTEND_SERVICE \
    --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/frontend:latest \
    --region $REGION \
    --project $PROJECT_ID \
    --allow-unauthenticated \
    --set-env-vars BACKEND_URL=$BACKEND_URL

echo "✅ Frontend Deployment Complete!"
echo "Frontend URL: $(gcloud run services describe $FRONTEND_SERVICE --region $REGION --project $PROJECT_ID --format 'value(status.url)')"
