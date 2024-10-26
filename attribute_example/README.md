# Thanos Receiver raise Error with Empty Attribute values

테스트를 할 시점의 Thanos Version은 0.36.1이였고, [Thanos Receiver Code](https://github.com/thanos-io/thanos/blob/v0.36.1/pkg/receive/writer.go)를 보면 아래와 같다.

```go
if numLabelsEmpty > 0 {
    level.Info(tLogger).Log("msg", "Error on series with empty label name or value", "numDropped", numLabelsEmpty)
    errs.Add(errors.Wrapf(labelpb.ErrEmptyLabels, "add %d series", numLabelsEmpty))
}
```

그래서 [Prometheus Remote Write Exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/prometheusremotewriteexporter/README.md)를 통해서 Opentelemetry collector에서 Thanos Receiver에 보낼려고 할 때, attribute가 `Str()`이나 `Empty()`이면 아래와 같은 에러 로그가 남는다.

```bash
2024-10-26T00:08:25.744Z	error	internal/queue_sender.go:92	Exporting failed. Dropping data.	{"kind": "exporter", "data_type": "metrics", "name": "prometheusremotewrite", "error": "Permanent error: Permanent error: Permanent error: remote write returned HTTP status 409 Conflict; err = %!w(<nil>): add 1 series: label set contains a label with empty name or value\n", "dropped_items": 5}
go.opentelemetry.io/collector/exporter/exporterhelper/internal.NewQueueSender.func1
	go.opentelemetry.io/collector/exporter@v0.111.0/exporterhelper/internal/queue_sender.go:92
go.opentelemetry.io/collector/exporter/internal/queue.(*boundedMemoryQueue[...]).Consume
	go.opentelemetry.io/collector/exporter@v0.111.0/internal/queue/bounded_memory_queue.go:52
go.opentelemetry.io/collector/exporter/internal/queue.(*Consumers[...]).Start.func1
	go.opentelemetry.io/collector/exporter@v0.111.0/internal/queue/consumers.go:43
```

## Nodejs Application

### 환경준비

```bash
docker build -t app:nodejs ./applications/nodejs
minikube image load app:nodejs
kubectl apply -f ./k8s/nodejs
```

### 요청

```bash
kubectl port-forward svc/my-nodejs-app 3000:3000 -n default
```

```bash
curl localhost:3000
```

### Metric

#### attribute value가 `빈문자열`일 때

```js
counter1.add(1, { "hello": "" });
```

```bash
ScopeMetrics #1
ScopeMetrics SchemaURL:
InstrumentationScope default
Metric #0
Descriptor:
     -> Name: empty
     -> Description:
     -> Unit:
     -> DataType: Sum
     -> IsMonotonic: true
     -> AggregationTemporality: Cumulative
NumberDataPoints #0
Data point attributes:
     -> hello: Str()
StartTimestamp: 2024-10-26 00:05:49.732 +0000 UTC
Timestamp: 2024-10-26 00:06:46.47 +0000 UTC
Value: 1.000000
```

#### attribute value가 `null`일 때

```js
counter2.add(1, { "hello": null });
```

```bash
Metric #1
Descriptor:
     -> Name: null
     -> Description:
     -> Unit:
     -> DataType: Sum
     -> IsMonotonic: true
     -> AggregationTemporality: Cumulative
NumberDataPoints #0
Data point attributes:
     -> hello: Empty()
StartTimestamp: 2024-10-26 00:05:49.732 +0000 UTC
Timestamp: 2024-10-26 00:06:46.47 +0000 UTC
Value: 1.000000
```

## Python Application

### 환경 설정

```bash
docker build -t app:python ./applications/python
minikube image load app:python
kubectl apply -f ./k8s/python
```

### 요청

```bash
kubectl port-forward svc/my-python-app 8000:8000 -n default
```

```bash
curl localhost:8000
```

### Metric

#### attribute value가 `빈문자열`일 때

```python
counter1.add(1, {"test": ""})
```

```bash
ScopeMetrics #1
ScopeMetrics SchemaURL:
InstrumentationScope test
Metric #0
Descriptor:
     -> Name: empty
     -> Description:
     -> Unit:
     -> DataType: Sum
     -> IsMonotonic: true
     -> AggregationTemporality: Cumulative
NumberDataPoints #0
Data point attributes:
     -> test: Str()
StartTimestamp: 2024-10-26 00:08:02.064389211 +0000 UTC
Timestamp: 2024-10-26 00:08:25.521302833 +0000 UTC
Value: 1
```

#### attribute value가 `None`일 때

```python
counter2.add(1, {"test": None})
```

Python Otel Package에서 None 데이터 타입을 허용하지 않아서 아래와 같이 Error가 발생한다.

```bash
Failed to encode key test: Invalid type <class 'NoneType'> of value None
Traceback (most recent call last):
  File "/venv/lib/python3.11/site-packages/opentelemetry/exporter/otlp/proto/common/_internal/__init__.py", line 113, in _encode_attributes
    pb2_attributes.append(_encode_key_value(key, value))
                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/venv/lib/python3.11/site-packages/opentelemetry/exporter/otlp/proto/common/_internal/__init__.py", line 94, in _encode_key_value
    return PB2KeyValue(key=key, value=_encode_value(value))
                                      ^^^^^^^^^^^^^^^^^^^^
  File "/venv/lib/python3.11/site-packages/opentelemetry/exporter/otlp/proto/common/_internal/__init__.py", line 90, in _encode_value
    raise Exception(f"Invalid type {type(value)} of value {value}")
Exception: Invalid type <class 'NoneType'> of value None
```

그리고 Metric의 Attribute는 없는 것으로 전달된다.

```bash
Metric #1
Descriptor:
     -> Name: none
     -> Description:
     -> Unit:
     -> DataType: Sum
     -> IsMonotonic: true
     -> AggregationTemporality: Cumulative
NumberDataPoints #0
StartTimestamp: 2024-10-26 00:08:02.064398086 +0000 UTC
Timestamp: 2024-10-26 00:08:25.521302833 +0000 UTC
Value: 1
```