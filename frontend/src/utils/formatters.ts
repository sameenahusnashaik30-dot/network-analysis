export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatBytes(bytes: number | undefined | null): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatRate(bps: number | undefined | null): string {
  if (!bps || bps === 0) return '0 B/s';
  return `${formatBytes(bps)}/s`;
}

export function formatDuration(seconds: number | undefined | null): string {
  if (!seconds) return '0s';
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

export function formatTimestamp(isoString: string | undefined | null): string {
  if (!isoString) return '--:--:--';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatFullDate(isoString: string | undefined | null): string {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  return d.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function resolveDeviceType(ip: string): string {
  if (ip === '10.0.0.1') return 'Core Gateway / Router';
  if (ip === '10.0.0.2') return 'Web Application Server';
  if (ip === '10.0.0.5') return 'Database Server';
  if (ip === '10.0.0.8') return 'API Gateway Node';
  if (ip === '10.0.0.12') return 'Message Broker';
  if (ip === '10.0.0.15') return 'Dev / Staging Host';
  if (ip === '10.0.0.88') return 'IoT Subnet Node';
  if (ip.startsWith('10.0.0.')) return `SDN Host (${ip.split('.')[3]})`;
  if (ip.startsWith('192.168.1.')) return `LAN Workstation (${ip.split('.')[3]})`;
  if (ip.startsWith('172.16.')) return 'DMZ Service Node';
  if (ip.startsWith('185.') || ip.startsWith('198.51.') || ip.startsWith('203.0.')) return 'External WAN Peer';
  if (ip === '127.0.0.1' || ip === 'localhost') return 'SDN Controller Host';
  return 'Network Device';
}

export function resolveSoftwareService(port: number, proto: string): string {
  if (port === 443) return 'HTTPS / TLS';
  if (port === 80) return 'HTTP Web';
  if (port === 53) return 'DNS Resolver';
  if (port === 22) return 'SSH Terminal';
  if (port === 8080) return 'HTTP Alt / Proxy';
  if (port === 8443) return 'HTTPS Microservice';
  if (port === 9443) return 'Admin Control API';
  if (port === 9092) return 'Kafka Event Bus';
  if (port === 27017) return 'Database Cluster';
  if (port >= 32768) return 'Dynamic Client Port';
  return `${proto}/${port}`;
}
