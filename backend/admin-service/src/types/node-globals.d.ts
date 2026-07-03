declare const process: {
  env: Record<string, string | undefined>;
  exit(code?: number): never;
  uptime(): number;
  on(event: string, listener: (...args: unknown[]) => void): void;
};

declare module 'mssql/msnodesqlv8';
declare const __dirname: string;
