export interface PackageCost {
  name: string;
  version: string;
  size: number;
  children: number;
  path: string;
}

export interface ScanOptions {
  path: string;
  includeDev: boolean;
}

export interface ScanResult {
  packages: PackageCost[];
  totalSize: number;
  totalChildren: number;
  totalPackages: number;
}

export interface CliOptions {
  less: boolean;
  includeDev: boolean;
  json: boolean;
  path: string;
}
