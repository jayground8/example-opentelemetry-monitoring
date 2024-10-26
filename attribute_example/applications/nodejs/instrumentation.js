const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
const {
  PeriodicExportingMetricReader,
} = require('@opentelemetry/sdk-metrics');

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
  }),
  instrumentations: [new HttpInstrumentation()],
});

sdk.start();

process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
    () => debugLog('SDK shut down successfully'),
    (err) => debugLog('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});