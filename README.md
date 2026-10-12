# ClinicFlow: Clinic Appointment Management

[![CI/CD](https://github.com/Harshita-008/devops-capstone-clinic/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Harshita-008/devops-capstone-clinic/actions/workflows/ci-cd.yml)

ClinicFlow is a small system for the front desk of a clinic. Staff can register patients, manage
doctors, book appointments and update each visit as it goes through the day (scheduled, checked in,
completed or cancelled).

The API also enforces a few clinic rules:

- a doctor cannot have two appointments within the same 30 minute slot
- an appointment cannot be booked in the past or with a doctor who is not taking bookings
- a patient or doctor with appointment history cannot be deleted, because that history is a medical record

This is my final DevOps capstone project. I built the application and then took it through the full
DevOps flow: tests, Docker, a CI/CD pipeline with security scanning, AWS infrastructure with
Terraform, Kubernetes with Helm, autoscaling, monitoring and automatic deployment.

## Architecture

```text
Developer
   |  git push
   v
GitHub Actions
   |  ruff + pytest, ESLint + frontend build
   |  docker build, Trivy scan, push to GHCR (tag = commit SHA)
   v
Developer sets the new tag in helm/clinicflow/values.yaml and pushes
   |
   v
Argo CD (inside the cluster, watches main)
   |
   v
Kubernetes (kind)
   Traefik Ingress: clinicflow.localhost
     /     ->  frontend (React + nginx, 2 pods)
     /api  ->  backend  (FastAPI, 2 to 5 pods with HPA)  ->  PostgreSQL (StatefulSet)
   Prometheus scrapes /metrics  ->  Grafana dashboard

Terraform  ->  AWS ap-south-1: VPC (2 public + 2 private subnets) and EKS cluster
```

## Tech stack

| Part | Tools |
|------|-------|
| Frontend | React, Vite, ESLint, nginx |
| Backend | Python 3.13, FastAPI, SQLAlchemy, Alembic |
| Database | PostgreSQL 17 |
| Testing | pytest, pytest-cov, ruff |
| Containers | Docker (multi-stage), Docker Compose |
| CI/CD | GitHub Actions, GitHub Container Registry, Trivy |
| Infrastructure | Terraform, AWS VPC, Amazon EKS |
| Kubernetes | kind, Helm, Traefik Ingress, metrics-server, HPA |
| Deployment | Argo CD |
| Monitoring | Prometheus, Grafana |

## Repository structure

```text
backend/            FastAPI app (models, schemas, services, routers), Alembic migrations, tests
frontend/           React app and the nginx config used in its image
docker-compose.yml  frontend + backend + PostgreSQL on one machine
.github/workflows/  CI/CD pipeline
terraform/          AWS VPC and EKS cluster
k8s/                kind cluster config, namespace, Traefik and metrics-server values, load test
helm/clinicflow/    Helm chart and the Grafana dashboard
monitoring/         Prometheus and Grafana (kube-prometheus-stack) values
gitops/             Argo CD values and the Application
troubleshooting/    broken manifests for the troubleshooting lab
screenshots/        evidence for each part of the project
```

## API

There are 19 REST endpoints. The Swagger page is at `/docs`.

| Resource | Endpoints |
|----------|-----------|
| Patients | `GET, POST /api/patients`, `GET, PUT, DELETE /api/patients/{id}` |
| Doctors | `GET, POST /api/doctors`, `GET, PUT, DELETE /api/doctors/{id}` |
| Appointments | `GET, POST /api/appointments`, `GET, PUT, DELETE /api/appointments/{id}` |
| Dashboard | `GET /api/dashboard/stats` |
| System | `/` (service info), `/health` (liveness), `/ready` (checks the database) |

The backend also serves `/metrics` for Prometheus.

## Run locally with Docker Compose

```bash
docker compose up --build -d
docker compose ps
```

All three services should show `(healthy)`. Then open:

- http://localhost:3000 for the app
- http://localhost:8000/docs for the API docs
- http://localhost:8000/metrics for the metrics

The backend runs the Alembic migrations when it starts, so the tables and four sample doctors are
created automatically.

## Tests

```bash
cd backend
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements-dev.txt
.venv/Scripts/python -m pytest -v
```

There are 32 tests with 99% coverage. They use an in-memory SQLite database (set up in
`tests/conftest.py`), so they never touch the real PostgreSQL database. Besides the normal CRUD
calls, they test the clinic rules, the filters, `/ready` returning 503 when the database is down,
and the metrics endpoint. The pipeline also runs `ruff` on the backend and ESLint on the frontend.

## CI/CD pipeline

The workflow in `.github/workflows/ci-cd.yml` runs on every push and pull request to `main`.

1. **Backend lint and tests:** ruff and pytest
2. **Frontend lint and build:** ESLint and `vite build`
3. **Build, scan and push:** builds the backend and frontend images, scans them with Trivy and pushes
   them to GHCR. This only runs if steps 1 and 2 pass, so a failing test stops the pipeline.

Images are tagged with the commit SHA only, for example
`ghcr.io/harshita-008/clinicflow-backend:4b0657b18e17c99a2f1a2138b5aec570898119c3`, so every running
pod can be traced back to one commit. Pull requests build and scan the images but do not push them.

A push that only changes the image tag in `values.yaml`, the README or screenshots does not start the
pipeline, because no new image is needed.

A green run of the full pipeline:
https://github.com/Harshita-008/devops-capstone-clinic/actions/runs/38243699393

## Security scan (Trivy)

Trivy scans both images in the pipeline and fails the build on any HIGH or CRITICAL vulnerability
that has a fix available (`ignore-unfixed: true`). Vulnerabilities without a released fix cannot be
fixed by me, so they would only block every build.

**What Trivy scanned and what the result means:** Trivy checked the OS packages of both images
(Debian 13 for the backend, Alpine 3.24 for the frontend) and the Python packages in the backend.
The first scan of the backend found 4 HIGH vulnerabilities, for example CVE-2026-97687 in `urllib3`,
which allows traffic interception through an HTTPS proxy. These libraries were not my dependencies;
they came bundled inside `pip`. The app does not need pip to run, so I removed it from the final
image. After that both images scan clean, which means no known fixable HIGH or CRITICAL issue was
found when they were built.

## Terraform (AWS)

The `terraform/` folder creates the cloud infrastructure in `ap-south-1` (Mumbai):

- a VPC with 2 public and 2 private subnets in 2 availability zones, an internet gateway and one NAT gateway
- an EKS cluster (Kubernetes 1.35) with a managed node group
- `terraform.tfvars.example` shows the variables; AWS credentials come from the AWS CLI and are never in the code

```bash
cd terraform
terraform init
terraform plan "-out=clinicflow.tfplan"
terraform apply "clinicflow.tfplan"
terraform destroy
```

I applied it, checked the VPC and cluster in the AWS console and with `kubectl get nodes`, and then
destroyed it in the same session to avoid charges. To keep the cost low it uses one NAT gateway and
one small node.

## Kubernetes and Helm

To save cost, the app runs on a local kind cluster.

```bash
kind create cluster --config k8s/kind-cluster.yaml
helm install traefik traefik/traefik --version 41.7.1 -n traefik --create-namespace -f k8s/addons/traefik-values.yaml --wait
helm install metrics-server metrics-server/metrics-server --version 3.14.0 -n kube-system -f k8s/addons/metrics-server-values.yaml --wait
kubectl apply -f k8s/namespace.yaml
helm upgrade --install clinicflow helm/clinicflow -n clinicflow --wait
```

The app then opens at http://clinicflow.localhost.

The Helm chart `helm/clinicflow` contains:

- backend and frontend Deployments (2 replicas each) with ClusterIP Services
- PostgreSQL as a StatefulSet with a persistent volume
- a Secret with the database settings
- an Ingress that sends `/api` to the backend and `/` to the frontend
- an HPA for the backend
- a ServiceMonitor and the Grafana dashboard (only added when Prometheus is installed)

All pods have liveness and readiness probes. The backend and frontend containers also run as
non-root users and drop all Linux capabilities. Database migrations run in an init container before the backend starts. Alembic takes
a PostgreSQL lock first, so two pods starting together never migrate the database at the same time.

## Deployment with Argo CD

GitHub Actions cannot reach a cluster running on my laptop, so I used Argo CD inside the cluster.
It watches `helm/clinicflow` on `main` and applies every change it finds.

```bash
helm install argocd argo/argo-cd --version 10.10.2 -n argocd --create-namespace -f gitops/argocd-values.yaml --wait
kubectl apply -f gitops/clinicflow-application.yaml
```

Auto sync is on, with `prune` and `selfHeal`, so the cluster always matches Git.

To release a new version:

1. push the code change and wait for the pipeline to go green
2. copy the commit SHA from the pipeline summary into `image.tag` in `helm/clinicflow/values.yaml`
3. commit and push

Argo CD checks Git every minute, picks up the new tag and replaces the pods one by one. Every
deployment is listed in the Argo CD history and can be rolled back from there.

## Autoscaling

The backend HPA keeps between 2 and 5 pods and targets 60% CPU. `k8s/load-test.yaml` sends requests
to the backend for 3 minutes:

```bash
kubectl apply -f k8s/load-test.yaml
kubectl get hpa -n clinicflow -w
```

During the test the backend scaled from 2 to 5 pods in about a minute and went back to 2 after the
load stopped.

## Monitoring

```bash
helm install monitoring prometheus-community/kube-prometheus-stack --version 92.3.0 -n monitoring --create-namespace -f monitoring/kube-prometheus-stack-values.yaml --wait
```

- Prometheus: http://prometheus.localhost
- Grafana: http://grafana.localhost (local demo login `admin` / `clinicflow-admin`)

Prometheus scrapes the backend `/metrics` endpoint every 15 seconds. The ClinicFlow dashboard is
stored in the Helm chart and Grafana loads it automatically. It shows requests per second, error
rate, p95 latency, CPU per pod, the number of backend pods and the HPA, plus two clinic metrics:
appointments booked and appointment status changes.

## Troubleshooting lab

[troubleshooting/README.md](troubleshooting/README.md) has two broken setups with the steps I used
to find and fix them:

1. a wrong image tag, which gives `ImagePullBackOff`
2. a Service with a typo in its selector, which has no endpoints

## Why I chose some tools

| Choice | Reason |
|--------|--------|
| Traefik instead of ingress-nginx | ingress-nginx was archived in March 2026 and gets no more security fixes. Traefik uses the same Kubernetes Ingress resource. |
| Argo CD | The pipeline cannot reach a local cluster, so the cluster pulls changes from Git instead. |
| kind for Kubernetes | It runs everything for free. EKS was created with Terraform, checked and then destroyed. |
| Commit SHA image tags | `latest` hides which version is running; a SHA points to one exact commit. |

## Screenshots

### Application

Dashboard running with Docker Compose:

![Dashboard on localhost:3000](screenshots/img_3.png)

API docs, with a live request and the full list of endpoints:

![Swagger request](screenshots/img_4a.png)
![Swagger endpoints](screenshots/img_4b.png)

PostgreSQL tables created by Alembic, with saved appointments:

![PostgreSQL tables](screenshots/img_5.png)

Health check, readiness check and metrics:

![Health and metrics](screenshots/img_7.png)

### Tests

![pytest](screenshots/img_1.png)

### Git

![Commit history](screenshots/img_31.png)

### Docker

![docker compose up](screenshots/img_2.png)
![Non-root containers and image sizes](screenshots/img_6.png)

### CI/CD and Trivy

![Pipeline run](screenshots/img_8.png)
![Trivy backend](screenshots/img_9a.png)
![Trivy frontend](screenshots/img_9b.png)
![GHCR backend](screenshots/img_10a.png)
![GHCR frontend](screenshots/img_10b.png)

### Terraform

![terraform plan](screenshots/img_11.png)
![terraform apply](screenshots/img_12.png)
![VPC](screenshots/img_13a.png)
![VPC subnets](screenshots/img_13b.png)
![EKS node group](screenshots/img_13c.png)
![EKS cluster](screenshots/img_13d.png)
![kubectl get nodes on EKS](screenshots/img_13e.png)
![terraform destroy](screenshots/img_14.png)

### Kubernetes and Helm

![helm upgrade --install](screenshots/img_15.png)
![Pods and Services](screenshots/img_16.png)
![helm list, Ingress and HPA](screenshots/img_17.png)
![App through the Ingress](screenshots/img_18.png)

### Autoscaling

![HPA scaling](screenshots/img_19.png)
![Pods under load](screenshots/img_20.png)

### Troubleshooting

![Wrong image](screenshots/img_21.png)
![Wrong image fixed](screenshots/img_22.png)
![Service without endpoints](screenshots/img_23.png)
![Service fixed](screenshots/img_24.png)

### Monitoring

![Prometheus target](screenshots/img_25.png)
![Grafana dashboard](screenshots/img_26.png)

### Commit to deployment

Argo CD in sync with Git:

![Argo CD](screenshots/img_27.png)

I changed the text under the logo and pushed. The pipeline tested, built, scanned and pushed the
images:

![Pipeline run for the change](screenshots/img_28.png)

I then set the new tag in `values.yaml` and pushed, and Argo CD deployed it:

![Argo CD history](screenshots/img_29.png)

The change live in the app:

![Change live](screenshots/img_30.png)

## Cleanup

```bash
kind delete cluster --name clinicflow
docker compose down -v
```

The AWS resources were already removed with `terraform destroy`.
