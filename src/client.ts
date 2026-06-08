import {
  callReadOnlyFunction,
  cvToJSON,
  uintCV,
  principalCV,
} from "@stacks/transactions";
import { StacksMainnet, StacksTestnet } from "@stacks/network";
import { GemCount, UserStats, GemPluckConfig, GEMS } from "./types";

export class GemPluckClient {
  private contractAddress: string;
  private contractName: string;
  private network: StacksMainnet | StacksTestnet;

  constructor(config: GemPluckConfig) {
    this.contractAddress = config.contractAddress;
    this.contractName = config.contractName;
    this.network =
      config.network === "testnet" ? new StacksTestnet() : new StacksMainnet();
  }

  /**
   * Get the pluck count for a specific gem (1-6).
   */
  async getGemCount(gemId: number): Promise<GemCount> {
    if (gemId < 1 || gemId > 6) {
      throw new Error("Gem ID must be between 1 and 6");
    }
    try {
      const result = await callReadOnlyFunction({
        network: this.network,
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: "get-gem-count",
        functionArgs: [uintCV(gemId)],
        senderAddress: this.contractAddress,
      });
      const json: any = cvToJSON(result);
      const count = parseInt(json.value ?? json ?? "0");
      return { gemId, count };
    } catch {
      return { gemId, count: 0 };
    }
  }

  /**
   * Get counts for all six gems in parallel.
   */
  async getAllGemCounts(): Promise<GemCount[]> {
    const promises = Array.from({ length: 6 }, (_, i) =>
      this.getGemCount(i + 1)
    );
    return Promise.all(promises);
  }

  /**
   * Get total plucks across all gems.
   */
  async getTotalPlucks(): Promise<number> {
    try {
      const result = await callReadOnlyFunction({
        network: this.network,
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: "total",
        functionArgs: [],
        senderAddress: this.contractAddress,
      });
      const json: any = cvToJSON(result);
      return parseInt(json.value ?? json ?? "0");
    } catch {
      return 0;
    }
  }

  /**
   * Get a user's pluck history (total + last gem).
   */
  async getUserStats(address: string): Promise<UserStats> {
    try {
      const [pluckRes, lastRes] = await Promise.all([
        callReadOnlyFunction({
          network: this.network,
          contractAddress: this.contractAddress,
          contractName: this.contractName,
          functionName: "get-user-plucks",
          functionArgs: [principalCV(address)],
          senderAddress: this.contractAddress,
        }),
        callReadOnlyFunction({
          network: this.network,
          contractAddress: this.contractAddress,
          contractName: this.contractName,
          functionName: "get-user-last-gem",
          functionArgs: [principalCV(address)],
          senderAddress: this.contractAddress,
        }),
      ]);
      const pluckJson: any = cvToJSON(pluckRes);
      const lastJson: any = cvToJSON(lastRes);
      const totalPlucks = parseInt(pluckJson.value ?? pluckJson ?? "0");
      const lastRaw = lastJson?.value?.value ?? lastJson?.value;
      const lastGem =
        lastRaw && lastRaw !== null && lastRaw !== undefined
          ? parseInt(lastRaw)
          : null;
      return { totalPlucks, lastGem: isNaN(lastGem as number) ? null : lastGem };
    } catch {
      return { totalPlucks: 0, lastGem: null };
    }
  }

  /**
   * Leaderboard — gems sorted by pluck count (descending), with names.
   */
  async getLeaderboard(): Promise<(GemCount & { name: string })[]> {
    const counts = await this.getAllGemCounts();
    return counts
      .map((c) => ({
        ...c,
        name: GEMS.find((g) => g.id === c.gemId)?.name ?? `Gem ${c.gemId}`,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Build the function args needed for a pluck transaction.
   * Use with @stacks/connect openContractCall().
   */
  getPluckArgs(gemId: number) {
    if (gemId < 1 || gemId > 6) {
      throw new Error("Gem ID must be between 1 and 6");
    }
    return {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: "pluck",
      functionArgs: [uintCV(gemId)],
    };
  }
}
