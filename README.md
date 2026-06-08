# gem-pluck-sdk

TypeScript SDK for interacting with the **Gem Pluck** smart contract on Stacks blockchain.

Gem Pluck is an on-chain pluck-a-gem dApp with 6 gems (Ruby, Sapphire, Emerald, Topaz, Amethyst, Onyx). Each pluck is recorded on Stacks mainnet (Clarity 4).

## Installation

```bash
npm install gem-pluck-sdk
```

## Quick Start

```typescript
import { GemPluckClient } from "gem-pluck-sdk";

const client = new GemPluckClient({
  contractAddress: "SP16F6839630K5XX06KE7KVNSNMYBK89912NH6N4C",
  contractName: "gem-pluck",
});

// Get count for gem #1 (Ruby)
const ruby = await client.getGemCount(1);
console.log(`Ruby: ${ruby.count}`);

// Get all 6 gem counts in parallel
const all = await client.getAllGemCounts();

// Total plucks across all gems
const total = await client.getTotalPlucks();

// Per-user stats
const me = await client.getUserStats("SP...");

// Leaderboard, sorted by count desc
const board = await client.getLeaderboard();

// Build pluck transaction args (use with @stacks/connect)
const args = client.getPluckArgs(3); // pluck Emerald
```

## API

### `new GemPluckClient(config)`

| Param | Type | Description |
|-------|------|-------------|
| `contractAddress` | `string` | Deployer's Stacks address |
| `contractName` | `string` | Contract name |
| `network` | `"mainnet" \| "testnet"` | Network (default: `"mainnet"`) |

### Methods

| Method | Returns |
|--------|---------|
| `getGemCount(gemId)` | `Promise<GemCount>` |
| `getAllGemCounts()` | `Promise<GemCount[]>` |
| `getTotalPlucks()` | `Promise<number>` |
| `getUserStats(address)` | `Promise<UserStats>` |
| `getLeaderboard()` | `Promise<(GemCount & { name: string })[]>` |
| `getPluckArgs(gemId)` | Args for `openContractCall` |

### Constants

```typescript
import { GEMS } from "gem-pluck-sdk";
// [{ id: 1, name: "Ruby", color: "#e02060" }, ...]
```

## License

MIT
