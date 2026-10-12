# Troubleshooting lab

Two deliberately broken manifests, each with the symptom, how to investigate it and the fix.
Both run in the `clinicflow` namespace next to the real release and do not affect it.

## Scenario 1: wrong image tag

```bash
kubectl apply -f troubleshooting/broken-image.yaml
kubectl get pods -n clinicflow -l app.kubernetes.io/name=clinicflow-broken-image
```

**Symptom:** the pod stays in `ErrImagePull`, then `ImagePullBackOff`, and never becomes Ready.

**Investigate:**

```bash
kubectl describe pod -n clinicflow -l app.kubernetes.io/name=clinicflow-broken-image
kubectl get events -n clinicflow --sort-by=.lastTimestamp
```

The Events section shows `Failed to pull image "...clinicflow-frontend:does-not-exist" ... not found`.

**Root cause:** the tag does not exist in GHCR. The pipeline only publishes commit SHA tags.

**Fix:** point the Deployment at a tag that exists. The deployed release shows the current one:

```bash
kubectl get deployment clinicflow-frontend -n clinicflow -o jsonpath="{.spec.template.spec.containers[0].image}"
kubectl set image deployment/clinicflow-broken-image -n clinicflow frontend=<image from the command above>
kubectl rollout status deployment/clinicflow-broken-image -n clinicflow
```

## Scenario 2: Service with no endpoints

```bash
kubectl apply -f troubleshooting/broken-service.yaml
kubectl run curl-test -n clinicflow --rm -it --restart=Never --image=curlimages/curl:8.22.0 -- curl -s -m 5 http://clinicflow-frontend-debug:8080/healthz
```

**Symptom:** the Service exists and has a ClusterIP, but requests to it time out or are refused.

**Investigate:**

```bash
kubectl get endpointslices -n clinicflow -l kubernetes.io/service-name=clinicflow-frontend-debug
kubectl describe service clinicflow-frontend-debug -n clinicflow
kubectl get pods -n clinicflow --show-labels
```

The EndpointSlice lists no addresses. The Service selector asks for `component=frontnd`, but the
frontend pods are labelled `component=frontend`.

**Root cause:** a Service sends traffic only to pods whose labels match its selector. No match means
no endpoints, so there is nowhere to send traffic.

**Fix:** correct the selector, then the endpoints appear and the request succeeds:

```bash
kubectl set selector service clinicflow-frontend-debug -n clinicflow "app.kubernetes.io/instance=clinicflow,app.kubernetes.io/component=frontend"
kubectl get endpointslices -n clinicflow -l kubernetes.io/service-name=clinicflow-frontend-debug
```

## Clean up

```bash
kubectl delete -f troubleshooting/broken-image.yaml -f troubleshooting/broken-service.yaml
```
