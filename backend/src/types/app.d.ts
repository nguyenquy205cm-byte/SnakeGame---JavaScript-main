export interface HealthResponse {
  status: string;
  service: string;
  uptime: number;
}

export interface VersionResponse {
  version: string;
  description: string;
}

export interface InfoResponse {
  appName: string;
  version: string;
  description: string;
  environment: string;
}
