/**
 * AveraCloud App Templates
 * One-Click App Templates for AI & Automation servers
 */

const APP_CATEGORIES = {
  AI: 'AI & Machine Learning',
  AUTOMATION: 'Automation & Workflow',
  DEV: 'Development Tools',
  MONITORING: 'Monitoring & Observability',
  DATABASE: 'Databases',
  MEDIA: 'Media & Content'
};

const APP_TEMPLATES = [
  {
    id: 'coolify',
    name: 'Coolify',
    description: 'Self-hosted Vercel/Netlify alternative. Deploy your apps and databases with ease.',
    icon: '🚀',
    category: 'DEV',
    version: 'v4.0.0',
    website: 'https://coolify.io',
    documentation: 'https://coolify.io/docs',
    requirements: {
      minRam: 2, // GB
      minCpu: 2, // cores
      minDisk: 40, // GB
      dockerRequired: true,
      ports: [3000, 8443]
    },
    installScript: `#!/bin/bash
set -e
echo "Installing Coolify..."

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker $USER
fi

# Install Coolify
curl -fsSL https://cdn.coollabs.io/coollabs/coolify/install.sh | bash

echo "Coolify installation complete!"
echo "Access Coolify at: http://$(hostname -I | awk '{print $1}'):3000"
`,
    postInstallNotes: [
      'Coolify will be available at port 3000',
      'First time access will require setup',
      'Make sure port 3000 is accessible from your firewall'
    ],
    environmentVariables: [],
    volumes: [
      { path: '/var/lib/coolify', description: 'Coolify data directory' }
    ]
  },
  {
    id: 'open-webui',
    name: 'Open WebUI',
    description: 'ChatGPT-like interface for local LLMs. Support for multiple AI models and chat history.',
    icon: '💬',
    category: 'AI',
    version: 'v0.3.0',
    website: 'https://openwebui.com',
    documentation: 'https://docs.openwebui.com',
    requirements: {
      minRam: 4,
      minCpu: 2,
      minDisk: 20,
      dockerRequired: true,
      ports: [3000]
    },
    installScript: `#!/bin/bash
set -e
echo "Installing Open WebUI..."

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker $USER
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create directory
mkdir -p /opt/open-webui
cd /opt/open-webui

# Create docker-compose.yml
cat > docker-compose.yml <<'EOF'
version: '3.8'

services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "3000:8080"
    environment:
      - OLLAMA_BASE_URL=http://host.docker.internal:11434
    volumes:
      - open-webui:/app/backend/data
    restart: always

volumes:
  open-webui:
    driver: local
EOF

# Start services
docker-compose up -d

echo "Open WebUI installation complete!"
echo "Access Open WebUI at: http://$(hostname -I | awk '{print $1}'):3000"
`,
    postInstallNotes: [
      'Open WebUI will be available at port 3000',
      'To use with local LLMs, install Ollama on the same server',
      'Default admin user created on first access'
    ],
    environmentVariables: [
      { name: 'OLLAMA_BASE_URL', description: 'Ollama API endpoint', default: 'http://host.docker.internal:11434' }
    ],
    volumes: [
      { path: '/opt/open-webui', description: 'Open WebUI configuration and data' }
    ]
  },
  {
    id: 'n8n',
    name: 'n8n',
    description: 'Workflow automation tool. Connect apps and automate tasks with a visual editor.',
    icon: '🔄',
    category: 'AUTOMATION',
    version: 'v1.0.0',
    website: 'https://n8n.io',
    documentation: 'https://docs.n8n.io',
    requirements: {
      minRam: 2,
      minCpu: 1,
      minDisk: 10,
      dockerRequired: true,
      ports: [5678]
    },
    installScript: `#!/bin/bash
set -e
echo "Installing n8n..."

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker $USER
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create directory
mkdir -p /opt/n8n
cd /opt/n8n

# Create docker-compose.yml
cat > docker-compose.yml <<'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=changeme
      - N8N_HOST=$(hostname -I | awk '{print $1}')
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://$(hostname -I | awk '{print $1}'):5678/
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
    driver: local
EOF

# Start services
docker-compose up -d

echo "n8n installation complete!"
echo "Access n8n at: http://$(hostname -I | awk '{print $1}'):5678"
echo "Default credentials: admin / changeme (please change immediately)"
`,
    postInstallNotes: [
      'n8n will be available at port 5678',
      'Default credentials: admin / changeme',
      'Remember to change the default password after first login'
    ],
    environmentVariables: [
      { name: 'N8N_BASIC_AUTH_USER', description: 'n8n admin username', default: 'admin' },
      { name: 'N8N_BASIC_AUTH_PASSWORD', description: 'n8n admin password', default: 'changeme' }
    ],
    volumes: [
      { path: '/opt/n8n', description: 'n8n configuration and data' }
    ]
  },
  {
    id: 'comfyui',
    name: 'ComfyUI',
    description: 'Powerful stable diffusion GUI with a node-based interface for AI image generation.',
    icon: '🎨',
    category: 'AI',
    version: 'latest',
    website: 'https://comfyanonymous.github.io/ComfyUI',
    documentation: 'https://github.com/comfyanonymous/ComfyUI',
    requirements: {
      minRam: 8,
      minCpu: 4,
      minDisk: 30,
      dockerRequired: false,
      ports: [8188],
      gpuRecommended: true
    },
    installScript: `#!/bin/bash
set -e
echo "Installing ComfyUI..."

# Update system
apt-get update && apt-get upgrade -y

# Install Python and dependencies
apt-get install -y python3 python3-pip python3-venv git

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Clone ComfyUI
cd /opt
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install -r requirements.txt

# Create systemd service
cat > /etc/systemd/system/comfyui.service <<'EOF'
[Unit]
Description=ComfyUI
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/ComfyUI
Environment="PATH=/opt/ComfyUI/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin"
ExecStart=/opt/ComfyUI/venv/bin/python main.py --listen 0.0.0.0 --port 8188
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable comfyui
systemctl start comfyui

echo "ComfyUI installation complete!"
echo "Access ComfyUI at: http://$(hostname -I | awk '{print $1}'):8188"
`,
    postInstallNotes: [
      'ComfyUI will be available at port 8188',
      'GPU is highly recommended for faster image generation',
      'Download models to /opt/ComfyUI/models/ directory'
    ],
    environmentVariables: [],
    volumes: [
      { path: '/opt/ComfyUI', description: 'ComfyUI installation and models' }
    ]
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Run large language models locally. Simple CLI to run Llama 2, Mistral, and other models.',
    icon: '🦙',
    category: 'AI',
    version: 'latest',
    website: 'https://ollama.ai',
    documentation: 'https://github.com/ollama/ollama',
    requirements: {
      minRam: 8,
      minCpu: 4,
      minDisk: 20,
      dockerRequired: false,
      ports: [11434],
      gpuRecommended: true
    },
    installScript: `#!/bin/bash
set -e
echo "Installing Ollama..."

# Update system
apt-get update && apt-get upgrade -y

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
systemctl enable ollama
systemctl start ollama

# Pull a default model
echo "Pulling default model (llama2)..."
ollama pull llama2

echo "Ollama installation complete!"
echo "Ollama API running at: http://$(hostname -I | awk '{print $1}'):11434"
echo "Test with: ollama run llama2"
`,
    postInstallNotes: [
      'Ollama API will be available at port 11434',
      'Default model llama2 has been downloaded',
      'Install more models with: ollama pull <model-name>'
    ],
    environmentVariables: [],
    volumes: [
      { path: '/usr/share/ollama', description: 'Ollama models' }
    ]
  },
  {
    id: 'jenkins',
    name: 'Jenkins',
    description: 'Open source automation server. Build, deploy, and automate any project.',
    icon: '🔧',
    category: 'DEV',
    version: '2.400+',
    website: 'https://www.jenkins.io',
    documentation: 'https://www.jenkins.io/doc',
    requirements: {
      minRam: 2,
      minCpu: 2,
      minDisk: 20,
      dockerRequired: true,
      ports: [8080, 50000]
    },
    installScript: `#!/bin/bash
set -e
echo "Installing Jenkins..."

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker $USER
fi

# Create directory
mkdir -p /opt/jenkins
cd /opt/jenkins

# Create docker-compose.yml
cat > docker-compose.yml <<'EOF'
version: '3.8'

services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    restart: always
    ports:
      - "8080:8080"
      - "50000:50000"
    environment:
      - JAVA_OPTS=-Dhudson.slaves.NodeProvisioner.MARGIN=50 -Dhudson.slaves.NodeProvisioner.MARGIN0=0.85
    volumes:
      - jenkins_home:/var/jenkins_home

volumes:
  jenkins_home:
    driver: local
EOF

# Start services
docker-compose up -d

echo "Jenkins installation complete!"
echo "Access Jenkins at: http://$(hostname -I | awk '{print $1}'):8080"
echo "Get initial admin password with: docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
`,
    postInstallNotes: [
      'Jenkins will be available at port 8080',
      'Get initial admin password from container logs',
      'Install plugins and create first admin user'
    ],
    environmentVariables: [],
    volumes: [
      { path: '/opt/jenkins', description: 'Jenkins configuration and data' }
    ]
  },
  {
    id: 'grafana',
    name: 'Grafana',
    description: 'Open-source analytics and interactive visualization platform. Beautiful dashboards for metrics.',
    icon: '📊',
    category: 'MONITORING',
    version: '10.0+',
    website: 'https://grafana.com',
    documentation: 'https://grafana.com/docs',
    requirements: {
      minRam: 1,
      minCpu: 1,
      minDisk: 10,
      dockerRequired: true,
      ports: [3000]
    },
    installScript: `#!/bin/bash
set -e
echo "Installing Grafana..."

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker $USER
fi

# Create directory
mkdir -p /opt/grafana
cd /opt/grafana

# Create docker-compose.yml
cat > docker-compose.yml <<'EOF'
version: '3.8'

services:
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: always
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
    driver: local
EOF

# Start services
docker-compose up -d

echo "Grafana installation complete!"
echo "Access Grafana at: http://$(hostname -I | awk '{print $1}'):3000"
echo "Default credentials: admin / admin (please change immediately)"
`,
    postInstallNotes: [
      'Grafana will be available at port 3000',
      'Default credentials: admin / admin',
      'Add data sources to start monitoring'
    ],
    environmentVariables: [
      { name: 'GF_SECURITY_ADMIN_USER', description: 'Grafana admin username', default: 'admin' },
      { name: 'GF_SECURITY_ADMIN_PASSWORD', description: 'Grafana admin password', default: 'admin' }
    ],
    volumes: [
      { path: '/opt/grafana', description: 'Grafana configuration and data' }
    ]
  },
  {
    id: 'portainer',
    name: 'Portainer',
    description: 'Container management platform. Easy UI for Docker and Kubernetes.',
    icon: '🐳',
    category: 'DEV',
    version: '2.19+',
    website: 'https://www.portainer.io',
    documentation: 'https://docs.portainer.io',
    requirements: {
      minRam: 1,
      minCpu: 1,
      minDisk: 5,
      dockerRequired: true,
      ports: [9443]
    },
    installScript: `#!/bin/bash
set -e
echo "Installing Portainer..."

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker $USER
fi

# Create volume
docker volume create portainer_data

# Run Portainer
docker run -d \
  --name portainer \
  --restart=always \
  -p 9443:9443 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  cr.portainer.io/portainer/portainer-ce:latest

echo "Portainer installation complete!"
echo "Access Portainer at: https://$(hostname -I | awk '{print $1}'):9443"
echo "Set up admin user on first access"
`,
    postInstallNotes: [
      'Portainer will be available at port 9443 (HTTPS)',
      'Set up admin user on first access',
      'Connect to local Docker endpoint automatically'
    ],
    environmentVariables: [],
    volumes: [
      { path: '/var/lib/docker/volumes/portainer_data', description: 'Portainer data' }
    ]
  },
  {
    id: 'meilisearch',
    name: 'Meilisearch',
    description: 'Lightning-fast, relevant search engine. Easy to integrate with any application.',
    icon: '🔍',
    category: 'DATABASE',
    version: '1.5+',
    website: 'https://www.meilisearch.com',
    documentation: 'https://docs.meilisearch.com',
    requirements: {
      minRam: 1,
      minCpu: 1,
      minDisk: 10,
      dockerRequired: true,
      ports: [7700]
    },
    installScript: `#!/bin/bash
set -e
echo "Installing Meilisearch..."

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker $USER
fi

# Create directory
mkdir -p /opt/meilisearch
cd /opt/meilisearch

# Create docker-compose.yml
cat > docker-compose.yml <<'EOF'
version: '3.8'

services:
  meilisearch:
    image: getmeili/meilisearch:v1.5
    container_name: meilisearch
    restart: always
    ports:
      - "7700:7700"
    environment:
      - MEILI_MASTER_KEY=changeme_to_secure_key
      - MEILI_ENV=production
    volumes:
      - meilisearch_data:/meili_data

volumes:
  meilisearch_data:
    driver: local
EOF

# Start services
docker-compose up -d

echo "Meilisearch installation complete!"
echo "Access Meilisearch at: http://$(hostname -I | awk '{print $1}'):7700"
echo "API Key: changeme_to_secure_key (please change in docker-compose.yml)"
`,
    postInstallNotes: [
      'Meilisearch will be available at port 7700',
      'Default master key: changeme_to_secure_key',
      'Change the master key in production'
    ],
    environmentVariables: [
      { name: 'MEILI_MASTER_KEY', description: 'Master API key', default: 'changeme_to_secure_key' }
    ],
    volumes: [
      { path: '/opt/meilisearch', description: 'Meilisearch configuration and data' }
    ]
  }
];

/**
 * Get app by ID
 */
function getAppById(id) {
  return APP_TEMPLATES.find(app => app.id === id);
}

/**
 * Get apps by category
 */
function getAppsByCategory(category) {
  return APP_TEMPLATES.filter(app => app.category === category);
}

/**
 * Get all apps
 */
function getAllApps() {
  return APP_TEMPLATES;
}

/**
 * Get all categories
 */
function getAllCategories() {
  return Object.entries(APP_CATEGORIES).map(([key, label]) => ({ key, label }));
}

module.exports = {
  APP_TEMPLATES,
  APP_CATEGORIES,
  getAppById,
  getAppsByCategory,
  getAllApps,
  getAllCategories
};
