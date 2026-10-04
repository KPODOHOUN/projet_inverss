// Verifies a claimed USDT deposit against the real blockchain, using each
// chain's free block explorer API (Etherscan-family — Etherscan, BscScan
// and Polygonscan all share the same API shape). No paid service, no
// private keys, no custody — just reading public chain data.
//
// USDT contract addresses are canonical/stable per network — safe to
// hardcode. Note BSC's USDT uses 18 decimals, unlike the 6 decimals used
// on Ethereum and Polygon — a well-known gotcha that silently produces
// wildly wrong amounts (off by 10^12) if missed.
const NETWORKS = {
  ERC20: {
    apiBase: 'https://api.etherscan.io/api',
    apiKeyEnv: 'ETHERSCAN_API_KEY',
    usdtContract: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    decimals: 6
  },
  BEP20: {
    apiBase: 'https://api.bscscan.com/api',
    apiKeyEnv: 'BSCSCAN_API_KEY',
    usdtContract: '0x55d398326f99059ff775485246999027b3197955',
    decimals: 18
  },
  POLYGON: {
    apiBase: 'https://api.polygonscan.com/api',
    apiKeyEnv: 'POLYGONSCAN_API_KEY',
    usdtContract: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    decimals: 6
  }
};

const TRANSFER_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

const isConfigured = (network) => {
  const cfg = NETWORKS[network];
  return !!(cfg && process.env[cfg.apiKeyEnv]);
};

// Reads a 32-byte topic/data hex word as an address (last 20 bytes) or a
// plain integer, matching how ERC20 Transfer logs encode `to` and `value`.
const topicToAddress = (topic) => '0x' + topic.slice(-40);
const hexToBigInt = (hex) => BigInt(hex);

// Returns { verified, reason, actualAmount? } — never throws; any network/
// parsing failure comes back as a clear non-verified reason so the caller
// can leave the deposit pending for a later retry or manual review instead
// of crashing the poller.
const verifyDeposit = async ({ network, txHash, expectedToAddress, expectedAmount }) => {
  const cfg = NETWORKS[network];
  if (!cfg) return { verified: false, reason: `Réseau non supporté pour la vérification automatique: ${network}` };
  const apiKey = process.env[cfg.apiKeyEnv];
  if (!apiKey) return { verified: false, reason: 'not_configured' };

  try {
    const url = `${cfg.apiBase}?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = await res.json();
    const receipt = data?.result;

    if (!receipt) return { verified: false, reason: 'not_found_yet' };
    if (receipt.status !== '0x1') return { verified: false, reason: 'transaction_failed' };

    const targetAddr = expectedToAddress.toLowerCase();
    const usdtContract = cfg.usdtContract.toLowerCase();

    const transferLog = (receipt.logs || []).find(log =>
      log.address?.toLowerCase() === usdtContract &&
      log.topics?.[0]?.toLowerCase() === TRANSFER_EVENT_TOPIC &&
      log.topics?.[2] && topicToAddress(log.topics[2]).toLowerCase() === targetAddr
    );

    if (!transferLog) return { verified: false, reason: 'no_matching_transfer' };

    const rawAmount = hexToBigInt(transferLog.data);
    const actualAmount = Number(rawAmount) / (10 ** cfg.decimals);

    // Allow a tiny tolerance for floating point noise, not for genuine
    // underpayment — a user who sent less than claimed should not be
    // auto-credited for the difference.
    const tolerance = 0.01;
    if (actualAmount < expectedAmount - tolerance) {
      return { verified: false, reason: 'amount_mismatch', actualAmount };
    }

    return { verified: true, actualAmount };
  } catch (err) {
    return { verified: false, reason: `lookup_error: ${err.message}` };
  }
};

module.exports = { verifyDeposit, isConfigured, NETWORKS };
