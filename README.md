# EKS Karpenter Demo

## Overview 

This section demonstrates how to install and configure Karpenter a Kubernetes cluster autoscaler designed for AWS EKS. Karpenter automatically provisions and manages EC2 instances based on pod scheduling requirements, offering faster scaling, better bin-packing, and cost optimization compared to traditional Cluster Autoscaler.

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

## Deployment Steps

### Step 1: Deploy VPC

```
cd 01_terraform/01_vpc
terraform init
terraform apply -auto-approve
```

### Step 2: Deploy EKS Cluster + Add-ons

```
cd 01_terraform/02_eks
terraform init
terraform apply -auto-approve
```
### Step 3: Deploy Karpenter 

```
cd 01_terraform/03_karpenter
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
cd 02_k8s/01_karpenter
kubectl apply -f 01_ec2nodeclass.yaml
kubectl apply -f 02_nodepool_ondemand.yaml
kubectl apply -f 03_nodepool_spot.yaml
```

### Step 7: Verify NodePools and EC2Nodeclass

```
kubectl get nodepools
kubectl get ec2nodeclass
```

### Step 8: Watch Karpenter logs 

```
kubectl logs -n kube-system -l app.kubernetes.io/name=karpenter -f

```

### Step 9: Deploy the application

```
cd 02_k8s/02_app
kubectl apply -f webapp.yaml
kubectl apply -f webapp-svc.yaml
kubectl apply -f webapp-hpa.yaml

```

### Step 10: Watch the pods & nodes

```
kubectl get pods
kubectl get nodes
```

### Step 11: Generate traffic and watch auto scaling

The `webapp` uses an HPA based on CPU utilization. In practice, traffic
increases CPU usage on the nginx pods, and that is what triggers scale-out.

```
kubectl get hpa karpenter-demo-hpa -w
kubectl apply -f 02_k8s/02_app/load-generator.yaml
kubectl get deploy karpenter-demo -w
```

### Step 12: Re-run the traffic test

Because the load generator is a `Job`, delete it before starting another run:

```
kubectl delete job webapp-load-generator --ignore-not-found
kubectl apply -f 02_k8s/02_app/load-generator.yaml
```

## Simple Karpenter Test Example

If you want a deterministic way to test Karpenter before using the HPA demo,
deploy the `inflate-ondemand` workload. It starts with `0` replicas, so you
can scale it up and down on demand.

### Why this example is useful

- Targets `karpenter.sh/capacity-type=on-demand`, so the pods land on the
  Karpenter on-demand NodePool
- Uses resource requests large enough to create pending pods and trigger node
  provisioning
- Scales back down cleanly so you can observe consolidation afterward

### Apply the example

```
kubectl apply -f 02_k8s/02_app/inflate-ondemand.yaml
kubectl scale deployment inflate-ondemand --replicas 6
```

### Watch Karpenter react

```
kubectl get pods -w
kubectl get nodeclaims
kubectl get nodes -L karpenter.sh/capacity-type
kubectl logs -n kube-system -l app.kubernetes.io/name=karpenter -f
```

### Scale back down and observe consolidation

```
kubectl scale deployment inflate-ondemand --replicas 0
kubectl get nodes -w
```

## Thanks
