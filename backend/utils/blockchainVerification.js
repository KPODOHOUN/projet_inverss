// Verifies a claimed USDT deposit against the real blockchain, using
// Etherscan's unified multichain API (api.etherscan.io/v2 — one API key,
// `chainid` picks the network, covers Ethereum/BSC/Polygon and more). No
// paid service, no private keys, no custody — just reading public chain
// data.
//
// USDT contract addresses are canonical/stable per network — safe to
// hardcode. Note BSC's USDT uses 18 decimals, unlike the 6 decimals used
// on Ethereum and Polygon — a well-known gotcha that silently produces
// wildly wrong amounts (off by 10^12) if missed.
const API_BASE = 'https://api.etherscan.io/v2/api';
const API_KEY_ENV = 'ETHERSCAN_API_KEY';

const NETWORKS = {
  ERC20: {
    chainId: 1,
    usdtContract: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    decimals: 6
  },
  // BSC IS on the unified API (chainid=56) but the free plan rejects it
  // ("Free API access is not supported for this chain") — confirmed live.
  // Kept configured here for when/if the plan is upgraded; freePlan:false
  // keeps it out of isConfigured() so BEP20 deposits just stay pending for
  // manual admin review instead of silently failing or false-rejecting.
  BEP20: {
    chainId: 56,
    usdtContract: '0x55d398326f99059ff775485246999027b3197955',
    decimals: 18,
    freePlan: false
  },
  POLYGON: {
    chainId: 137,
    usdtContract: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    decimals: 6
  }
};

const TRANSFER_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

const isConfigured = (network) => {
  const cfg = NETWORKS[network];
  return !!(cfg && cfg.freePlan !== false && process.env[API_KEY_ENV]);
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
  const apiKey = process.env[API_KEY_ENV];
  if (!apiKey) return { verified: false, reason: 'not_configured' };

  try {
    const url = `${API_BASE}?chainid=${cfg.chainId}&module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = await res.json();
    const receipt = data?.result;

    // An API/plan error comes back as {status:"0", message:"NOTOK", result:"<string>"}
    // — a string, not a receipt object. Must not be mistaken for a found-but-failed
    // transaction (that would wrongly auto-reject a legitimate deposit).
    if (!receipt || typeof receipt !== 'object') return { verified: false, reason: 'not_found_yet' };
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
