# デプロイ・運用ガイド

## 📖 GitHub Pages設定

**ドキュメントサイトの有効化手順:**

1. **リポジトリ設定**: GitHub > Settings > Pages
2. **Source設定**: "GitHub Actions" を選択
3. **ワークフロー実行**: 
   ```bash
   # 手動実行
   gh workflow run "Deploy GitHub Pages"
   
   # または docs/ 変更をpush
   git add docs/
   git commit -m "docs: update documentation"
   git push
   ```

**アクセス**: `https://fukudat412.github.io/mcp-template/`

## 🚀 デプロイ方法

### Docker Compose (推奨)

**本番環境用設定**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  mcp-agent:
    image: your-registry/mcp-agent:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - API_KEY=${API_KEY}
      - LOG_LEVEL=info
      - DATABASE_URL=${DATABASE_URL}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - mcp-agent
```

**デプロイコマンド**

```bash
# 本番用ビルド
docker build -t your-registry/mcp-agent:latest .

# イメージプッシュ
docker push your-registry/mcp-agent:latest

# デプロイ
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes

**デプロイメント設定**

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mcp-agent
  template:
    metadata:
      labels:
        app: mcp-agent
    spec:
      containers:
      - name: mcp-agent
        image: your-registry/mcp-agent:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: API_KEY
          valueFrom:
            secretKeyRef:
              name: mcp-agent-secrets
              key: api-key
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: mcp-agent-service
spec:
  selector:
    app: mcp-agent
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

**シークレット設定**

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: mcp-agent-secrets
type: Opaque
data:
  api-key: <base64-encoded-api-key>
  database-url: <base64-encoded-database-url>
```

### クラウドプラットフォーム

#### AWS ECS

```json
{
  "family": "mcp-agent",
  "taskRoleArn": "arn:aws:iam::123456789:role/ecsTaskRole",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "mcp-agent",
      "image": "your-registry/mcp-agent:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:mcp-agent-api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mcp-agent",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Google Cloud Run

```yaml
# clouddeploy.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: mcp-agent
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "false"
    spec:
      containerConcurrency: 100
      containers:
      - image: gcr.io/your-project/mcp-agent:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        - name: API_KEY
          valueFrom:
            secretKeyRef:
              name: mcp-agent-secrets
              key: api-key
        resources:
          limits:
            cpu: 1000m
            memory: 512Mi
```

## 📊 監視・ログ

### Prometheus メトリクス

```typescript
// src/middleware/metrics.ts
import promClient from 'prom-client';

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route']
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({ 
      method: req.method, 
      route: req.route?.path || req.path,
      status_code: res.statusCode 
    });
    httpRequestDuration.observe({ 
      method: req.method, 
      route: req.route?.path || req.path 
    }, duration);
  });
  
  next();
};
```

### ログ集約

**ELK Stack設定**

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"

  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

**Logstash設定**

```ruby
# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "mcp-agent" {
    json {
      source => "message"
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "mcp-agent-%{+YYYY.MM.dd}"
  }
}
```

### アラート設定

**Grafana ダッシュボード**

```json
{
  "dashboard": {
    "title": "MCP Agent Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph", 
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m]) / rate(http_requests_total[5m])",
            "legendFormat": "Error Rate"
          }
        ]
      }
    ]
  }
}
```

## 🔐 セキュリティ

### SSL/TLS設定

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://mcp-agent:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### シークレット管理

**AWS Secrets Manager**

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

export async function getSecret(secretName: string): Promise<string> {
  const client = new SecretsManagerClient({ region: "us-west-2" });
  
  try {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretName })
    );
    return response.SecretString || '';
  } catch (error) {
    throw new Error(`Failed to retrieve secret: ${secretName}`);
  }
}
```

## 🔄 CI/CD パイプライン

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: |
          docker build -t ${{ secrets.REGISTRY_URL }}/mcp-agent:${{ github.sha }} .
          docker tag ${{ secrets.REGISTRY_URL }}/mcp-agent:${{ github.sha }} ${{ secrets.REGISTRY_URL }}/mcp-agent:latest

      - name: Push to registry
        run: |
          echo ${{ secrets.REGISTRY_PASSWORD }} | docker login ${{ secrets.REGISTRY_URL }} -u ${{ secrets.REGISTRY_USERNAME }} --password-stdin
          docker push ${{ secrets.REGISTRY_URL }}/mcp-agent:${{ github.sha }}
          docker push ${{ secrets.REGISTRY_URL }}/mcp-agent:latest

      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # kubectl apply -f k8s/
          # or other deployment commands
```

## 📈 スケーリング

### 水平スケーリング

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mcp-agent-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mcp-agent
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### ロードバランシング

```nginx
# nginx負荷分散設定
upstream mcp_agent_backend {
    least_conn;
    server mcp-agent-1:3000 weight=1 max_fails=3 fail_timeout=30s;
    server mcp-agent-2:3000 weight=1 max_fails=3 fail_timeout=30s;
    server mcp-agent-3:3000 weight=1 max_fails=3 fail_timeout=30s;
}

server {
    location / {
        proxy_pass http://mcp_agent_backend;
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
    }
}
```