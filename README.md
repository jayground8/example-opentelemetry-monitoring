- [Example 환경](#example-환경)
  - [Minikube](#minikube)
  - [Thanos](#thanos)
  - [Prometheus](#prometheus)
  - [Grafana](#grafana)
  - [Tempo](#tempo)
  - [Opentelemetry Collector](#opentelemetry-collector)

# Example 환경

## Minikube

```bash
minikube start --container-runtime=containerd --cni=cilium --kubernetes-version=v1.28.10
```

## Thanos

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install thanos \
    --values helm/thanos/values.yml \
    --namespace monitoring \
    bitnami/thanos
```

## Prometheus

```
helm repo add prometheus  https://prometheus-community.github.io/helm-charts
helm install prometheus \
    --values helm/prometheus/values.yml \
    --namespace monitoring \
    prometheus/kube-prometheus-stack
```

## Grafana

```
helm repo add grafana https://grafana.github.io/helm-charts
helm install grafana grafana/grafana \
    --values helm/grafana/values.yml \
    --namespace monitoring
```

## Tempo

```
helm install tempo grafana/tempo \
    --values helm/tempo/values.yml \
    --namespace monitoring
```

## Opentelemetry Collector

```
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install opentelemetry-collector open-telemetry/opentelemetry-collector  \
    --values helm/open-telemetry-collector/values.yml \
    --namespace monitoring
```