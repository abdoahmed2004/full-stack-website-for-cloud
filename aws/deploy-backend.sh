#!/bin/bash

# EC2 Backend Deployment Script
# This script automates the deployment of PHP backend to AWS EC2

# Variables - Update these with your values
EC2_IP="YOUR_EC2_IP_HERE"
KEY_FILE="YOUR_KEY_FILE.pem"
EC2_USER="ec2-user"

echo "====================================="
echo "TechStore Backend Deployment Script"
echo "====================================="

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "Error: backend directory not found!"
    exit 1
fi

# Copy backend files to EC2
echo "Copying backend files to EC2..."
scp -i "$KEY_FILE" backend/*.php "$EC2_USER@$EC2_IP:/tmp/"

if [ $? -ne 0 ]; then
    echo "Error: Failed to copy files to EC2"
    exit 1
fi

# SSH into EC2 and configure
echo "Configuring backend on EC2..."
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_IP" << 'ENDSSH'
    # Move files to Apache directory
    sudo mkdir -p /var/www/html/api
    sudo mv /tmp/*.php /var/www/html/api/
    
    # Set permissions
    sudo chown -R apache:apache /var/www/html/api
    sudo chmod -R 755 /var/www/html/api
    
    # Ensure session directory exists
    sudo mkdir -p /var/lib/php/session
    sudo chown -R apache:apache /var/lib/php/session
    sudo chmod -R 700 /var/lib/php/session
    
    # Restart Apache
    sudo systemctl restart httpd
    
    echo "Backend deployment completed!"
ENDSSH

if [ $? -ne 0 ]; then
    echo "Error: Failed to configure backend on EC2"
    exit 1
fi

echo "====================================="
echo "Deployment completed successfully!"
echo "Backend API available at: http://$EC2_IP/api/"
echo "====================================="
