/**
 * Provably Fair Gaming System
 * Uses SHA-256 hashing to ensure game fairness and transparency
 */

// Generate a random hex string
export function generateSeed(length: number = 32): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// SHA-256 hash function (using Web Crypto API)
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate game result from seeds
export async function generateGameResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<number> {
  const combined = `${serverSeed}:${clientSeed}:${nonce}`;
  const hash = await sha256(combined);

  // Convert first 8 characters of hash to number between 0-1
  const hexValue = parseInt(hash.substring(0, 8), 16);
  return hexValue / 0xffffffff;
}

// Generate crash multiplier (for crash game)
export async function generateCrashMultiplier(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<number> {
  const result = await generateGameResult(serverSeed, clientSeed, nonce);

  // Using 1% house edge
  const houseEdge = 0.01;
  const multiplier = (1 - houseEdge) / (1 - result);

  // Cap at 1000x, minimum 1.00x
  return Math.max(1, Math.min(1000, Math.floor(multiplier * 100) / 100));
}

// Generate color game result (red or blue)
export async function generateColorResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<'red' | 'blue'> {
  const result = await generateGameResult(serverSeed, clientSeed, nonce);
  return result < 0.5 ? 'red' : 'blue';
}

// Generate coin flip result
export async function generateCoinFlip(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<'HEADS' | 'TAILS'> {
  const result = await generateGameResult(serverSeed, clientSeed, nonce);
  return result < 0.5 ? 'HEADS' : 'TAILS';
}

// Generate wheel result (0-9)
export async function generateWheelResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<number> {
  const result = await generateGameResult(serverSeed, clientSeed, nonce);
  return Math.floor(result * 10);
}

// Verify a game result
export async function verifyGameResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  expectedHash: string
): Promise<boolean> {
  const combined = `${serverSeed}:${clientSeed}:${nonce}`;
  const hash = await sha256(combined);
  return hash === expectedHash;
}

// Create a provably fair game session
export interface GameSession {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
}

export async function createGameSession(clientSeed?: string): Promise<GameSession> {
  const serverSeed = generateSeed(64);
  const serverSeedHash = await sha256(serverSeed);

  return {
    serverSeed,
    serverSeedHash,
    clientSeed: clientSeed || generateSeed(32),
    nonce: 0
  };
}

// Store game result for verification
export interface GameRecord {
  gameId: string;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  result: any;
  timestamp: number;
}

export function saveGameRecord(record: GameRecord): void {
  const records = getGameRecords();
  records.push(record);

  // Keep only last 100 games
  if (records.length > 100) {
    records.shift();
  }

  localStorage.setItem('wagxa_game_records', JSON.stringify(records));
}

export function getGameRecords(): GameRecord[] {
  const stored = localStorage.getItem('wagxa_game_records');
  return stored ? JSON.parse(stored) : [];
}

export function clearGameRecords(): void {
  localStorage.removeItem('wagxa_game_records');
}
