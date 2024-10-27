require('./instrumentation');
const http = require('node:http');
const opentelemetry = require('@opentelemetry/api');

const counter1 = opentelemetry.metrics.getMeter('default').createCounter('empty');
const counter2 = opentelemetry.metrics.getMeter('default').createCounter('null');
const counter3 = opentelemetry.metrics.getMeter('default').createCounter('sample');

function fibo(n) {
    if (n <= 2) return 1
    return fibo(n - 2) + fibo(n - 1)
}

http
  .createServer((req, res) => {
    counter1.add(1, { "hello": "" });
    counter2.add(1, { "hello": null });
    counter3.add(1, { "hello": "world" });
    const result = fibo(38)
    res.write(`${result}\n`);
    res.end();
  })
  .listen(3000);