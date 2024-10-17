interface QREntry {
  qr: string;
  timestamp: number;
}

const qrStorage = new Map<string, QREntry>();

export function storeQR(clientId: string, qr: string): void {
  qrStorage.set(clientId, { qr, timestamp: Date.now() });
}

export function getLatestQR(clientId: string): string | null {
  const entry = qrStorage.get(clientId);
  return entry ? entry.qr : null;
}
