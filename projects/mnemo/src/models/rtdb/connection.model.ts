export interface IConnection {
  description: string;
  driver: string;
  guid: string;
  host: string;
  id: number;
  login: string;
  name: string;
  password: string;
  secret: string;
  skipTLSVerification: boolean;
  techName: string;
  timeout: string;
}
