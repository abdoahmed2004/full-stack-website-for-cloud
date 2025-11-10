#!/bin/bash

# S3 Frontend Deployment Script
# This script automates the deployment of frontend to AWS S3

# Variables - Update these with your values
BUCKET_NAME="techstore-frontend-bucket"
AWS_REGION="us-east-1"

echo "======================================"
echo "TechStore Frontend Deployment Script"
echo "======================================"

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "Error: frontend directory not found!"
    exit 1
fi

# Create S3 bucket if it doesn't exist
echo "Creating S3 bucket if it doesn't exist..."
aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION 2>/dev/null || echo "Bucket already exists"

# Enable static website hosting
echo "Enabling static website hosting..."
aws s3 website s3://$BUCKET_NAME/ \
    --index-document index.html \
    --error-document index.html

# Apply bucket policy for public access
echo "Applying bucket policy..."
aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy file://aws/s3-bucket-policy.json

# Disable block public access
echo "Configuring public access settings..."
aws s3api put-public-access-block \
    --bucket $BUCKET_NAME \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Upload frontend files
echo "Uploading frontend files to S3..."
aws s3 sync frontend/ s3://$BUCKET_NAME/ \
    --exclude ".git/*" \
    --exclude ".DS_Store" \
    --cache-control "public, max-age=3600" \
    --delete

# Set correct content types
echo "Setting content types..."
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
    --recursive \
    --exclude "*" \
    --include "*.html" \
    --content-type "text/html" \
    --metadata-directive REPLACE

aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
    --recursive \
    --exclude "*" \
    --include "*.css" \
    --content-type "text/css" \
    --metadata-directive REPLACE

aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
    --recursive \
    --exclude "*" \
    --include "*.js" \
    --content-type "application/javascript" \
    --metadata-directive REPLACE

echo "======================================"
echo "Deployment completed successfully!"
echo "Website URL: http://$BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"
echo "======================================"
