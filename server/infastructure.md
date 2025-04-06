# AWS Deployment Guide

## Overview

This repository contains a web application with a Go backend. This README provides instructions for deploying the application on AWS infrastructure.

## Infrastructure Requirements

- VPC with public and private subnets
- EC2 instance for application hosting
- PostgreSQL RDS database
- API Gateway for traffic routing and authentication

## Deployment Instructions

### 1. VPC Setup

Create a VPC with the following configuration:

- IPv4 CIDR block: `10.0.0.0/16`
- Create 3 subnets:
  - Public subnet: `10.0.0.0/24`
  - Private subnet 1: `10.0.1.0/24`
  - Private subnet 2: `10.0.2.0/24` (different availability zone)
- Create and attach an internet gateway
- Create route tables for each subnet
- Configure the public subnet route table to route `0.0.0.0/0` through the internet gateway

### 2. EC2 Instance Setup

- Launch a Linux t2.micro instance
- Create a new key pair
- Allow SSH, HTTPS, and HTTP traffic
- Place in the VPC's public subnet
- Enable "Auto-assign public IP"

### 3. Install Dependencies

Connect to your EC2 instance and run:

```bash
# Switch to root user
sudo su -

# Update system packages
sudo yum update -y

# Install Git
sudo yum install git -y

# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
. ~/.nvm/nvm.sh

# Install Node.js
nvm install node

# Install Go
wget https://go.dev/dl/go1.21.3.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.3.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# Install Air for Go development
go install github.com/air-verse/air@latest
echo 'export PATH=$PATH:~/go/bin' >> ~/.bashrc
source ~/.bashrc

# Install Make
sudo yum install -y make

# Optional: Install Bun for frontend
curl -fsSL https://bun.sh/install | bash
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### 4. Deploy Application

```bash
# Clone repository
git clone [your-github-link]
cd Rent-App

# Set up backend
cd server
go mod download
echo "PORT=80" > .env

# Compile application
cd cmd
go build -o rentapp
```

### 5. Configure Process Management

Create a systemd service to manage the application:

```bash
sudo nano /etc/systemd/system/rentapp.service
```

Add the following configuration:

```
[Unit]
Description=Rental App Server
After=network.target

[Service]
User=root
WorkingDirectory=/root/Rent-App/server
ExecStart=/root/Rent-App/server/cmd/rentapp
Restart=always
RestartSec=5
EnvironmentFile=/root/Rent-App/server/.env
StandardOutput=file:/var/log/rentapp.log
StandardError=file:/var/log/rentapp-error.log

[Install]
WantedBy=multi-user.target
```

Start and enable the service:

```bash
sudo systemctl daemon-reload
sudo systemctl start rentapp
sudo systemctl enable rentapp
```

### 6. RDS Database Setup

- Create a PostgreSQL RDS instance (Free tier template)
- Place in your VPC with public access disabled
- Create a new security group
- Configure security groups:
  - RDS: Allow inbound PostgreSQL connections from EC2 security group
  - EC2: Allow outbound PostgreSQL connections to RDS security group
- Update `.env` with database credentials:
  ```
  DB_HOST=your-rds-endpoint
  DB_PORT=5432
  DB_USER=postgres
  DB_PASSWORD=your-password
  DB_NAME=your-db-name
  ```
- Run database migrations:
  ```bash
  make run-migration-up
  ```

### 7. API Gateway Configuration

- Create a REST API
- Create a proxy resource:
  - Path: `/`
  - Name: `{proxy+}`
  - Enable CORS
- Configure the ANY method with HTTP proxy integration:
  - Endpoint: `http://{EC2-Public-IP}/{proxy}`
- Create Cognito authorizer with token source "Authorization"
- Apply authorizer to the proxy resource
- For public endpoints, create a separate resource:
  - Path: `/`
  - Name: `properties`
  - Configure GET method with endpoint `http://{EC2-Public-IP}/{endpoint}`
- Deploy the API and note the invoke URL

## Monitoring and Management

- View application logs: `tail -f /var/log/rentapp.log`
- Restart application: `sudo systemctl restart rentapp`
- Stop application: `sudo systemctl stop rentapp`
- Check status: `sudo systemctl status rentapp`

## Security Considerations

- The EC2 instance must be in a public subnet with a public IP
- The RDS instance should be in a private subnet with no public access
- All communication between components must be secured through security groups
- API Gateway should use Cognito for authentication on protected endpoints
