export interface SNMPPrinterData {
  printerName: string;
  serialNumber: string;
  model: string;
  type: 'color' | 'bw';
  inkLevels: {
    black: number;
    cyan?: number;
    magenta?: number;
    yellow?: number;
  };
  drumLevels: {
    black: number;
    cyan?: number;
    magenta?: number;
    yellow?: number;
  };
  counters: {
    total: number;
    black: number;
    color?: number;
  };
}