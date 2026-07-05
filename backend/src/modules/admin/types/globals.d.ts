declare const process: {
  env: Record<string, string | undefined>;
  exit(code?: number): never;
  uptime(): number;
  on(event: string, listener: (...args: unknown[]) => void): void;
};

declare const console: {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
};

declare function require(id: string): any;

declare const module: {
  exports: any;
};
