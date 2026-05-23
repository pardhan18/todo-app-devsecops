Developer
   ↓
GitHub (Source Code)
   ↓  (Webhook trigger)
Jenkins CI Pipeline
   ↓
────────────────────────
CI STAGE
────────────────────────
✔ Code Checkout                           (X DONE)
❌ Unit Tests                             (Y NOT DONE)
❌ Linting                               (Y NOT DONE)
❌ SonarQube Analysis                    (Y NOT DONE)
❌ Dependency Scan                       (Y NOT DONE)
✔ Docker Build                          (X DONE)
🟡 Tag Image (v1 only, no commit tagging) (PARTIAL)

   ↓
Docker Registry (DockerHub / ECR)
   ↓
❌ DockerHub / ECR Push                 (Y NOT DONE)

   ↓
────────────────────────
CD STAGE
────────────────────────
✔ Deploy to Dev Environment             (X DONE - local only)
🟡 Smoke Test                           (PARTIAL / removed earlier)
❌ Deploy to Staging                    (Y NOT DONE)
❌ Approval Gate (manual)               (Y NOT DONE)
❌ Deploy to Production                 (Y NOT DONE)

   ↓
────────────────────────
POST DEPLOYMENT
────────────────────────
🟡 Basic logs (docker logs)            (PARTIAL)
❌ Health Check (/health)              (Y NOT DONE)
❌ Monitoring (Prometheus/Grafana)     (Y NOT DONE)
❌ Logging (ELK Stack)                 (Y NOT DONE)
❌ Alerting (Slack/Email)             (Y NOT DONE)

   ↓
────────────────────────
Rollback System (if failure)
────────────────────────
❌ Rollback system                     (Y NOT DONE)
