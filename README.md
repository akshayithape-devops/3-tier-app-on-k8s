# EKS Infrastructure & 3-Tier Application Demo

## Overview 

This project demonstrates how to deploy and operate a production-like 3-tier Task Manager application on AWS EKS, using Terraform and Kubernetes.

It covers:

- AWS EKS cluster provisioning using Terraform
- Dynamic node scaling using Karpenter
- Deployment of a full 3-tier application (Frontend, Backend, Database)
- Autoscaling using HPA
- Database deployment using both basic and operator-based approaches

The main focus of this project is the end-to-end application deployment and scaling, with Karpenter used as the underlying compute scaling mechanism.

## Architecture Highlights

- Frontend: React + Nginx (UI layer)
- Backend: Node.js REST APIs
- Database: MongoDB / Percona MongoDB Operator
- Infrastructure: AWS EKS (managed Kubernetes)
- Autoscaling: HPA + Karpenter (node provisioning)

## What is Karpenter?

Karpenter is an open-source, flexible, high-performance Kubernetes cluster autoscaler that:

- Provisions nodes in seconds, not minutes
- Automatically selects optimal instance types based on pod requirements
- Supports Spot instances with graceful interruption handling
- Consolidates nodes to reduce costs when capacity is underutilized
- Eliminates the need for managing Auto Scaling Groups (ASGs)

## Project Structure

```
02_3_Tier_App_Deploy_On_EKS_Demo
├── 01_terraform
│   ├── 01_vpc
│   │   ├── main.tf
│   │   ├── modules
│   │   │   └── vpc
│   │   │       ├── datasources-and-locals.tf
│   │   │       ├── main.tf
│   │   │       ├── outputs.tf
│   │   │       ├── README.md
│   │   │       └── variables.tf
│   │   ├── outputs.tf
│   │   ├── provider.tf
│   │   ├── terraform.tfvars
│   │   └── variables.tf
│   ├── 02_eks
│   │   ├── datasources_and_locals.tf
│   │   ├── ebscsi-eksaddon.tf
│   │   ├── ebscsi-eks-pod-identity-association.tf
│   │   ├── ebscsi-iam-policy-and-role.tf
│   │   ├── eksaddon_metrics_server.tf
│   │   ├── eks_cluster_iamrole.tf
│   │   ├── eks_cluster.tf
│   │   ├── eks_nodegroup_iamrole.tf
│   │   ├── eks_nodegroup_private.tf
│   │   ├── env
│   │   │   ├── dev.tfvars
│   │   │   ├── prod.tfvars
│   │   │   └── staging.tfvars
│   │   ├── externaldns-eksaddon.tf
│   │   ├── externaldns-iam-policy-and-role.tf
│   │   ├── externaldns-pod-identity-association.tf
│   │   ├── helm-and-kubernetes-providers.tf
│   │   ├── lbc-eks-pod-identity-association.tf
│   │   ├── lbc-helm-install.tf
│   │   ├── lbc-iam-policy-and-role.tf
│   │   ├── lbc-iam-policy-datasources.tf
│   │   ├── outputs.tf
│   │   ├── podidentityagent-eksaddon.tf
│   │   ├── podidentity-assumerole.tf
│   │   ├── provider.tf
│   │   ├── remote-state.tf
│   │   ├── secretstorecsi-ascp-helm-install.tf
│   │   ├── secretstorecsi-helm-install.tf
│   │   ├── tags.tf
│   │   ├── terraform.tfvars
│   │   └── variables.tf
│   └── 03_karpenter
│       ├── datasources_and_locals.tf
│       ├── eks_remote_state.tf
│       ├── helm_and_kubernetes_providers.tf
│       ├── karpenter_access_entry.tf
│       ├── karpenter_controller_iam_policy.tf
│       ├── karpenter_controller_iam_role.tf
│       ├── karpenter_eventbridge_rules.tf
│       ├── karpenter_helm_install.tf
│       ├── karpenter_node_iam_role.tf
│       ├── karpenter_pod_identity_association.tf
│       ├── karpenter_sqs_queue.tf
│       ├── provider.tf
│       ├── variables.tf
│       └── vpc_remote_state.tf
├── 02_k8s
│   ├── 01_karpenter
│   │   ├── 01_ec2nodeclass.yaml
│   │   ├── 02_nodepool_ondemand.yaml
│   │   └── 03_nodepool_spot.yaml
│   ├── 02_app
│   │   ├── inflate-ondemand.yaml
│   │   ├── load-generator.yaml
│   │   ├── webapp-hpa.yaml
│   │   ├── webapp-svc.yaml
│   │   └── webapp.yaml
│   └── 03_task_manager
│       ├── 01_database
│       │   ├── 01-db-secrets.yaml
│       │   ├── 02-db-mongo-cluster.yaml
│       │   ├── 02-db-percona-mongo-cluster.yaml
│       │   └── 03-db-service.yaml
│       ├── 02_backend
│       │   ├── 01-backend-configmap.yaml
│       │   ├── 02-backend-deployment.yaml
│       │   ├── 03-backend-service.yaml
│       │   ├── 04-backend-ingress.yaml
│       │   └── 05-backend-hpa.yaml
│       ├── 03_frontend
│       │   ├── 01-frontend-configmap.yaml
│       │   ├── 02-frontend-deployment.yaml
│       │   ├── 03-frontend-service.yaml
│       │   ├── 04-frontend-ingress.yaml
│       │   └── 05-frontend-hpa.yaml
│       └── app-namespace.yaml
├── 03_task_manager
│   ├── 01_frontend
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   ├── postcss.config.js
│   │   ├── public
│   │   │   ├── env.js
│   │   │   └── index.html
│   │   ├── src
│   │   │   ├── App.js
│   │   │   ├── index.css
│   │   │   └── index.js
│   │   └── tailwind.config.js
│   └── 02_backend
│       ├── app.js
│       ├── dockerfile
│       └── package.json
└── README.md

11 directories, 63 files
```

## Prerequisites

- ✅ AWS CLI configured with appropriate credentials
- ✅ Terraform >= 1.13.0 installed
- ✅ kubectl >= 1.34 installed
- ✅ Helm >= 3.0 installed
- ✅ S3 bucket for Terraform remote state (update bucket names in c1_versions.tf for each terraform project)

## Demo #01 - Simple App Deployment Steps

### Step 1: Deploy VPC

```
cd terraform/vpc
terraform init
terraform apply -auto-approve
```

### Step 2: Deploy EKS Cluster + Add-ons

```
cd terraform/eks
terraform init
terraform apply -auto-approve
```
### Step 3: Deploy Karpenter 

```
cd terraform/karpenter
terraform init
terraform apply -auto-approve
```

### Step 4: Configure kubectl 

```
aws eks --region ap-south-1 --profile eks-demo-cloudops update-kubeconfig --name retail-dev-eks-karpenter-demo
```

### Step 5: Verify Karpenter is running

```
kubectl get pods -n kube-system -l app.kubernetes.io/name=karpenter
```

### Step 6: Apply Karpenter Configuration

```
cd k8s/karpenter
kubectl apply -f 01_ec2nodeclass.yaml
kubectl apply -f 02_nodepool_ondemand.yaml
kubectl apply -f 03_nodepool_spot.yaml
```

### Step 7: Verify NodePools and EC2Nodeclass

```
ectl get nodepools
kubectl get ec2nodeclass
```

### Step 8: Watch Karpenter logs 

```
kubectl logs -n kube-system -l app.kubernetes.io/name=karpenter -f

```

### Step 9: Deploy the application - Simple App

```
cd k8s/app
kubectl apply -f webapp.yaml
kubectl apply -f webapp-svc.yaml
kubectl apply -f webapp-hpa.yaml
kubectl apply -f load-generator.yaml

```

### Step 10: Watch the pods & nodes

```
kubectl get pods
kubectl get nodes
```

## Demo #02 - 3-tier App Deployment Steps

### Step 1: Deploy VPC

```
cd terraform/vpc
terraform init
terraform apply -auto-approve
```

### Step 2: Deploy EKS Cluster + Add-ons

```
cd terraform/eks
terraform init
terraform apply -auto-approve
```
### Step 3: Deploy Karpenter 

```
cd terraform/karpenter
terraform init
terraform apply -auto-approve
```

### Step 4: Configure kubectl 

```
aws eks --region ap-south-1 --profile eks-demo-cloudops update-kubeconfig --name retail-dev-eks-karpenter-demo
```

### Step 5: Verify Karpenter is running

```
kubectl get pods -n kube-system -l app.kubernetes.io/name=karpenter
```

### Step 6: Apply Karpenter Configuration

```
cd k8s/karpenter
kubectl apply -f 01_ec2nodeclass.yaml
kubectl apply -f 02_nodepool_ondemand.yaml
kubectl apply -f 03_nodepool_spot.yaml
```

### Step 7: Verify NodePools and EC2Nodeclass

```
ectl get nodepools
kubectl get ec2nodeclass
```

### Step 8: Watch Karpenter logs 

```
kubectl logs -n kube-system -l app.kubernetes.io/name=karpenter -f

```

### Step 9: Build Docker Image - Frontend  

```
cd 03_task_manager/01_frontend/
aws ecr get-login-password --region ap-south-1 --profile eks-demo-cloudops | docker login --username AWS --password-stdin repo-url
docker buildx build -f Dockerfile --platform linux/amd64 -t 3-tier-app-demo/frontend .
docker tag 3-tier-app-demo/frontend:latest 970453994651.dkr.ecr.ap-south-1.amazonaws.com/3-tier-app-demo/frontend:latest
docker push 970453994651.dkr.ecr.ap-south-1.amazonaws.com/3-tier-app-demo/frontend:latest
```

### Step 10: Build Docker Image - Backend  

```
cd 03_task_manager/01_backend/
docker buildx build -f Dockerfile --platform linux/amd64 -t 3-tier-app-demo/backend .
docker tag 3-tier-app-demo/frontend:latest 970453994651.dkr.ecr.ap-south-1.amazonaws.com/3-tier-app-demo/backend:latest
docker push 970453994651.dkr.ecr.ap-south-1.amazonaws.com/3-tier-app-demo/backend:latest
```

### Step 11: Deploy Namespace  

```
cd 02_k8s/03_task_manager/
kubectl apply -f app-namespace.yaml
```

### Step 12: Deploy DB - Single Server  

```
cd 02_k8s/03_task_manager/01_database/ 
kubectl apply -f 01-db-secrets.yaml
kubectl apply -f 02-db-mongo-cluster.yaml
kubectl apply -f 03-db-service.yaml

kubectl get nodes
kubectl get pods -n three-tier-app
```

### Step 13: Deploy DB - Backend Server 

```
cd 02_k8s/03_task_manager/02_backend/ 
kubectl apply -f 01-backend-configmap.yaml
kubectl apply -f 02-backend-deployment.yaml
kubectl apply -f 03-backend-service.yaml
kubectl apply -f 04-backend-ingress.yaml


kubectl get nodes
kubectl get pods -n three-tier-app
```

### Step 14: Deploy DB - Frontend Server 

```
cd 02_k8s/03_task_manager/03_frontend/ 
kubectl apply -f 01-frontend-configmap.yaml
kubectl apply -f 02-frontend-deployment.yaml
kubectl apply -f 03-frontend-service.yaml
kubectl apply -f 04-frontend-ingress.yaml


kubectl get nodes
kubectl get pods -n three-tier-app
```

### Step 15: Test the App 

```
# GET Call
for i in {1..1000}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
  http://k8s-threetie-frontend-a5ba41a647-1397024141.ap-south-1.elb.amazonaws.com/ &
done
wait

# POST Call
for i in {1..1000}; do
  curl -s -X POST "http://k8s-threetie-frontend-a5ba41a647-2059190062.ap-south-1.elb.amazonaws.com/tasks" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"task-$i\"}" &
done

wait
```

### Step 16: Deploy DB - Cluster using operator  

```
cd 02_k8s/03_task_manager/01_database/ 
kubectl delete -f 03-db-service.yaml
kubectl delete -f 02-db-mongo-cluster.yaml
kubectl apply -f 01-db-secrets.yaml
kubectl apply -f 02-db-percona-mongo-cluster.yaml
kubectl apply -f 03-db-percona-service.yaml

kubectl get nodes
kubectl get pods -n three-tier-app
```

### Step 17: Deploy DB - Backend Server 

```
cd 02_k8s/03_task_manager/02_backend/ 
kubectl apply -f 01-backend-configmap.yaml
kubectl apply -f 02-backend-deployment.yaml
kubectl apply -f 05-backend-hpa.yaml

kubectl get nodes
kubectl get pods -n three-tier-app
```

### Step 18: Deploy DB - Frontend Server 

```
cd 02_k8s/03_task_manager/03_frontend/ 
kubectl apply -f 05-frontend-hpa.yaml


kubectl get nodes
kubectl get pods -n three-tier-app
```

### Step 19: Test the App 

```
# GET Call
for i in {1..1000}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
  http://k8s-threetie-frontend-a5ba41a647-1397024141.ap-south-1.elb.amazonaws.com/ &
done
wait

# POST Call
for i in {1..1000}; do
  curl -s -X POST "http://k8s-threetie-frontend-a5ba41a647-2059190062.ap-south-1.elb.amazonaws.com/tasks" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"task-$i\"}" &
done

wait
```

## Thanks