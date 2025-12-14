// 메트릭 수집 미들웨어

class MetricsCollector {
  constructor() {
    this.totalRequests = 0;
    this.totalErrors = 0;
    this.latencies = [];
    this.requestsPerMinute = [];
    this.lastMinuteRequests = 0;
    this.startTime = Date.now();

    // 1분마다 요청 수 집계
    setInterval(() => {
      this.requestsPerMinute.push(this.lastMinuteRequests);
      if (this.requestsPerMinute.length > 10) {
        this.requestsPerMinute.shift();
      }
      this.lastMinuteRequests = 0;
    }, 60000);
  }

  recordRequest(latency) {
    this.totalRequests++;
    this.lastMinuteRequests++;
    this.latencies.push(latency);

    if (this.latencies.length > 1000) {
      this.latencies.shift();
    }
  }

  recordError() {
    this.totalErrors++;
  }

  getAvgLatency() {
    if (this.latencies.length === 0) return 0;
    return this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
  }

  getErrorRate() {
    if (this.totalRequests === 0) return 0;
    return (this.totalErrors / this.totalRequests) * 100;
  }

  getRequestsPerMinute() {
    if (this.requestsPerMinute.length === 0) return this.lastMinuteRequests;
    const sum = this.requestsPerMinute.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.requestsPerMinute.length);
  }

  getMetrics() {
    return {
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      avgLatency: this.getAvgLatency(),
      errorRate: this.getErrorRate(),
      requestsPerMinute: this.getRequestsPerMinute(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  reset() {
    this.totalRequests = 0;
    this.totalErrors = 0;
    this.latencies = [];
    this.requestsPerMinute = [];
    this.lastMinuteRequests = 0;
    this.startTime = Date.now();
  }
}

const metricsCollector = new MetricsCollector();

// ✅ 수정된 미들웨어
const metricsMiddleware = (req, res, next) => {
  // 🔴 메트릭 조회 + 대시보드 파일 요청은 집계 제외
  if (
    req.path.startsWith("/metrics") ||
    req.path.endsWith(".html")
  ) {
    return next();
  }

  const startTime = Date.now();

  res.on("finish", () => {
    const latency = Date.now() - startTime;
    metricsCollector.recordRequest(latency);

    if (res.statusCode >= 400) {
      metricsCollector.recordError();
    }
  });

  next();
};

export { metricsMiddleware, metricsCollector };
