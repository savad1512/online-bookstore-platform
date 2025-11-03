#!/bin/bash

# EC2 Setup Script for Ubuntu Linux
# Run this script on your Ubuntu EC2 instance after cloning the repository

echo "=========================================="
echo "EC2 Setup Script for Ubuntu - Bookstore Platform"
echo "=========================================="

# Update system packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "Installing Docker..."
if command -v docker &> /dev/null; then
    echo "Docker already installed: $(docker --version)"
else
    # Install Docker
    sudo apt install docker.io -y
    sudo systemctl start docker
    sudo systemctl enable docker
    echo "Docker installed: $(docker --version)"
fi

# Add user to docker group (works for ubuntu user)
sudo usermod -aG docker ubuntu
sudo usermod -aG docker $USER 2>/dev/null || true

# Install Docker Compose
echo "Installing Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo "Docker Compose already installed: $(docker-compose --version)"
else
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed: $(docker-compose --version)"
fi

# Get EC2 public IP
echo ""
echo "=========================================="
echo "EC2 Information:"
echo "=========================================="
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "Unable to retrieve")
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null || echo "Unable to retrieve")
echo "Public IP: $PUBLIC_IP"
echo "Instance ID: $INSTANCE_ID"

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "⚠️  IMPORTANT: Log out and log back in for docker group to take effect!"
echo "   Or run: newgrp docker"
echo ""
echo "Next steps:"
echo "1. Configure AWS Security Groups to allow:"
echo "   - Port 8001 (Users Service)"
echo "   - Port 8002 (Books Service)"
echo "   - Port 8003 (Orders Service)"
echo "   - Port 8004 (Payments Service)"
echo "   - Port 8005 (Reviews Service)"
echo ""
echo "2. Navigate to project directory:"
echo "   cd ~/microservice"
echo ""
echo "3. Start all services (includes PostgreSQL databases):"
echo "   docker-compose up --build -d"
echo ""
echo "4. Check if services are running:"
echo "   docker-compose ps"
echo ""
echo "5. View logs:"
echo "   docker-compose logs -f"
echo ""
echo "6. Test services:"
echo "   curl http://localhost:8001"
echo "   curl http://$PUBLIC_IP:8001  # From your local machine"
echo ""

