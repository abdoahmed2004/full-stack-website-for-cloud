# AWS Deployment Guide

### Deploying Backend to EC2

1. **Set up an EC2 Instance:**
   - Log in to your AWS console.
   - Navigate to the EC2 service and click on "Launch Instance."
   - Choose an appropriate Amazon Machine Image (AMI), such as Amazon Linux or Ubuntu.
   - Select the instance type based on your application's requirements.
   - Configure security group settings to allow HTTP, HTTPS, and SSH access.

2. **Connect to the EC2 Instance:**
   - Use SSH to connect to your instance using the command:
     ```
     ssh -i "your-key.pem" ec2-user@your-instance-public-dns
     ```

3. **Install Required Software:**
   - Update the package manager:
     ```
     sudo yum update -y
     ```
   - Install any required packages like Node.js, npm, etc.

4. **Clone Your Repository:**
   - Use git to clone your backend repository:
     ```
     git clone https://github.com/abdoahmed2004/full-stack-website-for-cloud.git
     ```

5. **Configure Environment Variables:**
   - Set up your `.env` configuration for the backend.

6. **Run Your Application:**
   - Navigate to your backend directory and start your server:
     ```
     cd full-stack-website-for-cloud/backend
     npm install
     npm start
     ```

### Deploying Frontend to S3

1. **Set up an S3 Bucket:**
   - In the AWS console, navigate to S3 and click "Create Bucket."
   - Name your bucket (matching your desired domain) and configure settings.

2. **Upload Your Frontend Files:**
   - Build your frontend application (e.g., using `npm run build`).
   - Upload the contents of the build directory to your S3 bucket.

3. **Configure Bucket for Website Hosting:**
   - Enable static website hosting in the properties of your S3 bucket and set the index and error document.

4. **Set Permissions:**
   - Adjust the bucket policy to allow public access to the files.

5. **Access Your Frontend Application:**
   - After uploading and configuring, you can access your site using the S3 endpoint.
