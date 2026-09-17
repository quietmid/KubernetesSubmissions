# todo-app
If you are searching for solution and see this and want to test this. 

# Prerequisties
You need Docker, k3d, and kubectl.

# Full Walkthrough 
### 1. Create the k3d cluster
```bash 
k3d cluster create mycluster # can swap out mycluster to any name you like
```
confirm the cluster is up and kubectl is pointed at it:
```bash
kubectl config current-context # k3d-mycluster
kubectl get nodes
```
### 2. Build the image
```bash
docker build -t todo-app:0.1.0 .
```
### 3. Import the image into the cluster
```bash
k3d image import todo-app:0.1.0 -c mycluster
```
### 4. Deploy the app
```bash
kubectl apply -f deployment.yaml
```
### 5. Check if the pod is ready
```bash
kubectl get pods -w # the w flag is watching the pod when it shows Running and 1/1. you can Ctrl-C and stop watching
```
### 6. Verify the log
```bash
kubectl logs deploy/todo-app
```

