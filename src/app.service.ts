import { Injectable } from '@nestjs/common';
import { createRequire } from 'node:module';
import * as os from 'node:os';
import process from 'node:process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class AppService {
  private readonly require = createRequire(__filename);

  private formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const unitIndex = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1,
    );

    const value = bytes / 1024 ** unitIndex;
    const formatted =
      value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1);
    return `${formatted} ${units[unitIndex]}`;
  }

  private formatUptime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  }

  private safeGetPackageVersion(packageName: string): string | null {
    try {
      const pkgJson = this.require(`${packageName}/package.json`) as {
        version?: unknown;
      };
      return typeof pkgJson.version === 'string' ? pkgJson.version : null;
    } catch {
      return null;
    }
  }

  private safeReadAppPackageJson(): {
    name?: string;
    version?: string;
  } | null {
    try {
      const content = readFileSync(join(process.cwd(), 'package.json'), 'utf8');
      const parsed = JSON.parse(content) as {
        name?: unknown;
        version?: unknown;
      };

      return {
        name: typeof parsed.name === 'string' ? parsed.name : undefined,
        version:
          typeof parsed.version === 'string' ? parsed.version : undefined,
      };
    } catch {
      return null;
    }
  }

  getSystemInfo() {
    const cpuInfo = os.cpus();
    const appPkg = this.safeReadAppPackageJson();

    return {
      app: {
        name: appPkg?.name ?? null,
        version: appPkg?.version ?? null,
      },
      framework: {
        name: 'nestjs',
        versions: {
          core: this.safeGetPackageVersion('@nestjs/core'),
          common: this.safeGetPackageVersion('@nestjs/common'),
          platformExpress: this.safeGetPackageVersion(
            '@nestjs/platform-express',
          ),
        },
      },
      cpu: {
        model: cpuInfo[0]?.model ?? 'unknown',
        cores: cpuInfo.length,
      },
      memory: {
        total: this.formatBytes(os.totalmem()),
        free: this.formatBytes(os.freemem()),
      },
      os: {
        type: os.type(),
        platform: os.platform(),
        release: os.release(),
        arch: os.arch(),
        hostname: os.hostname(),
      },
      node: {
        version: process.version,
        env: {
          nodeEnv: process.env.NODE_ENV ?? null,
          port: process.env.PORT ?? null,
        },
      },
      process: {
        memoryUsage: {
          rss: this.formatBytes(process.memoryUsage().rss),
          heapTotal: this.formatBytes(process.memoryUsage().heapTotal),
          heapUsed: this.formatBytes(process.memoryUsage().heapUsed),
          external: this.formatBytes(process.memoryUsage().external),
          arrayBuffers: this.formatBytes(process.memoryUsage().arrayBuffers),
        },
      },
      uptime: {
        system: this.formatUptime(os.uptime()),
        process: this.formatUptime(process.uptime()),
      },
    };
  }
}
