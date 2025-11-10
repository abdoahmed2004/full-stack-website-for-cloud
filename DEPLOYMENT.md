# AWS Deployment Configuration

## AWS EC2 Deployment (PHP Backend)

### Prerequisites
- AWS Account
- AWS CLI installed and configured
- SSH key pair for EC2 access

### Step 1: Launch EC2 Instance

1. **Create EC2 Instance**:
   ```bash
   aws ec2 run-instances \
     --image-id ami-0c55b159cbfafe1f0 \
     --instance-type t2.micro \
     --key-name your-key-name \
     --security-group-ids sg-xxxxxxxxx \
     --subnet-id subnet-xxxxxxxxx \
     --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=TechStore-Backend}]'
   ```

2. **Configure Security Group**:
   - Allow inbound HTTP (80)
   - Allow inbound HTTPS (443)
   - Allow inbound SSH (22) from your IP

### Step 2: Install PHP and Apache

SSH into your EC2 instance:
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

Install required packages:
```bash
# For Amazon Linux 2
sudo yum update -y
sudo amazon-linux-extras enable php7.4
sudo yum install -y httpd php php-cli php-json php-mbstring

# Start Apache
sudo systemctl start httpd
sudo systemctl enable httpd
```

### Step 3: Deploy Backend Code

1. **Copy backend files to EC2**:
   ```bash
   # From your local machine
   scp -i your-key.pem -r backend/* ec2-user@your-ec2-ip:/tmp/
   ```

2. **Move files to Apache directory**:
   ```bash
   # On EC2 instance
   sudo mkdir -p /var/www/html/api
   sudo mv /tmp/*.php /var/www/html/api/
   sudo chown -R apache:apache /var/www/html/api
   sudo chmod -R 755 /var/www/html/api
   ```

3. **Configure Apache for PHP sessions**:
   ```bash
   sudo mkdir -p /var/lib/php/session
   sudo chown -R apache:apache /var/lib/php/session
   sudo chmod -R 700 /var/lib/php/session
   ```

4. **Configure CORS (if needed)**:
   ```bash
   sudo nano /etc/httpd/conf.d/cors.conf
   ```
   
   Add:
   ```apache
   <Directory "/var/www/html/api">
       Header set Access-Control-Allow-Origin "*"
       Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
       Header set Access-Control-Allow-Headers "Content-Type"
   </Directory>
   ```

5. **Restart Apache**:
   ```bash
   sudo systemctl restart httpd
   ```

### Step 4: Test Backend

Test your API endpoints:
```bash
curl http://your-ec2-ip/api/products.php?action=list
curl http://your-ec2-ip/api/cart.php?action=get
```

---

## AWS S3 Deployment (Frontend Static Files)

### Step 1: Create S3 Bucket

1. **Create bucket**:
   ```bash
   aws s3 mb s3://techstore-frontend-bucket --region us-east-1
   ```

2. **Enable static website hosting**:
   ```bash
   aws s3 website s3://techstore-frontend-bucket/ \
     --index-document index.html \
     --error-document index.html
   ```

3. **Set bucket policy for public read**:
   
   Create a file `bucket-policy.json`:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::techstore-frontend-bucket/*"
       }
     ]
   }
   ```
   
   Apply the policy:
   ```bash
   aws s3api put-bucket-policy \
     --bucket techstore-frontend-bucket \
     --policy file://bucket-policy.json
   ```

### Step 2: Configure Frontend for Backend URL

Update `frontend/js/config.js` with your EC2 backend URL:
```javascript
const API_BASE_URL = 'http://your-ec2-ip/api';
```

### Step 3: Upload Frontend Files

1. **Upload all frontend files**:
   ```bash
   aws s3 sync frontend/ s3://techstore-frontend-bucket/ \
     --exclude ".git/*" \
     --exclude ".DS_Store" \
     --cache-control "public, max-age=3600"
   ```

2. **Set correct content types**:
   ```bash
   aws s3 cp s3://techstore-frontend-bucket/ s3://techstore-frontend-bucket/ \
     --recursive \
     --exclude "*" \
     --include "*.html" \
     --content-type "text/html" \
     --metadata-directive REPLACE

   aws s3 cp s3://techstore-frontend-bucket/ s3://techstore-frontend-bucket/ \
     --recursive \
     --exclude "*" \
     --include "*.css" \
     --content-type "text/css" \
     --metadata-directive REPLACE

   aws s3 cp s3://techstore-frontend-bucket/ s3://techstore-frontend-bucket/ \
     --recursive \
     --exclude "*" \
     --include "*.js" \
     --content-type "application/javascript" \
     --metadata-directive REPLACE
   ```

### Step 4: Access Your Website

Your frontend will be available at:
```
http://techstore-frontend-bucket.s3-website-us-east-1.amazonaws.com
```

---

## Optional: CloudFront Distribution (CDN)

For better performance and HTTPS support:

1. **Create CloudFront distribution**:
   ```bash
   aws cloudfront create-distribution \
     --origin-domain-name techstore-frontend-bucket.s3.amazonaws.com \
     --default-root-object index.html
   ```

2. **Configure custom error responses** for SPA routing:
   - Error code: 403, 404
   - Response page path: /index.html
   - Response code: 200

---

## Environment Variables

### Backend (EC2)
No environment variables needed as we're using in-memory storage.

### Frontend (S3)
Update `API_BASE_URL` in `js/config.js` before deployment.

---

## Testing the Deployment

1. **Test Frontend**:
   - Open S3 website URL in browser
   - Navigate through pages
   - Test product search and filtering

2. **Test Backend**:
   - Check browser console for API calls
   - Verify products load correctly
   - Test cart operations
   - Test checkout process

3. **Test Integration**:
   - Add products to cart
   - Update cart quantities
   - Complete checkout process
   - Verify session persistence

---

## Troubleshooting

### Backend Issues
- Check Apache logs: `sudo tail -f /var/log/httpd/error_log`
- Verify PHP is working: Create `info.php` with `<?php phpinfo(); ?>`
- Check file permissions: `ls -la /var/www/html/api/`
- Verify CORS headers: Check browser console for CORS errors

### Frontend Issues
- Check S3 bucket policy is public
- Verify static website hosting is enabled
- Check browser console for errors
- Ensure API_BASE_URL is correct in config.js

### CORS Issues
- Verify Apache CORS configuration
- Check that OPTIONS requests are handled
- Ensure headers are set correctly in PHP files

---

## Updating the Application

### Update Backend:
```bash
# Copy new files
scp -i your-key.pem backend/*.php ec2-user@your-ec2-ip:/tmp/

# Move to Apache directory
ssh -i your-key.pem ec2-user@your-ec2-ip
sudo mv /tmp/*.php /var/www/html/api/
sudo systemctl restart httpd
```

### Update Frontend:
```bash
# Sync changes
aws s3 sync frontend/ s3://techstore-frontend-bucket/ --delete

# Invalidate CloudFront cache (if using CloudFront)
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

---

## Cost Estimation

- **EC2 t2.micro**: ~$8-10/month (free tier eligible for 1 year)
- **S3 Storage**: ~$0.023/GB/month + data transfer
- **CloudFront** (optional): Pay-as-you-go based on traffic

---

## Security Recommendations

1. **Use HTTPS**: Set up SSL certificate with AWS ACM and CloudFront
2. **Restrict Security Groups**: Limit SSH access to your IP only
3. **Enable WAF**: Protect against common web attacks
4. **Regular Updates**: Keep EC2 instance and PHP updated
5. **Session Security**: Configure secure session settings in PHP
6. **Input Validation**: Already implemented in backend PHP files

---

## Monitoring

1. **CloudWatch Monitoring**:
   ```bash
   aws cloudwatch get-metric-statistics \
     --namespace AWS/EC2 \
     --metric-name CPUUtilization \
     --dimensions Name=InstanceId,Value=i-xxxxxxxxx \
     --start-time 2025-01-01T00:00:00Z \
     --end-time 2025-01-02T00:00:00Z \
     --period 3600 \
     --statistics Average
   ```

2. **Apache Access Logs**:
   ```bash
   sudo tail -f /var/log/httpd/access_log
   ```

3. **S3 Access Logging**: Enable server access logging for S3 bucket
