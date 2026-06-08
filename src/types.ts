export interface GemCount {
  gemId: number;
  count: number;
}

export interface UserStats {
  totalPlucks: number;
  lastGem: number | null;
}

export interface GemInfo {
  id: number;
  name: string;
  color: string;
}

export interface GemPluckConfig {
  contractAddress: string;
  contractName: string;
  network?: "mainnet" | "testnet";
}

export const GEMS: GemInfo[] = [
  { id: 1, name: "Ruby",     color: "#e02060" },
  { id: 2, name: "Sapphire", color: "#2060e0" },
  { id: 3, name: "Emerald",  color: "#20c060" },
  { id: 4, name: "Topaz",    color: "#e0a020" },
  { id: 5, name: "Amethyst", color: "#a020e0" },
  { id: 6, name: "Onyx",     color: "#404040" },
];
