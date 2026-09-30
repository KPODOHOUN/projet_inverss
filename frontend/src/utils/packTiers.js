// The 11 investment packs are grouped into 5 tiers for features that grant
// benefits based on tier rather than the specific pack (academy access level).
export const PACK_KEY_TIER = {
  cac40: 'bronze',
  eurostoxx50: 'bronze',
  ftse100: 'bronze',
  nikkei225: 'silver',
  dowjones30: 'silver',
  nasdaq100: 'gold',
  sp500: 'gold',
  russell2000: 'platinum',
  bund: 'platinum',
  tbonds: 'diamond',
  us10y: 'diamond',
};

export const TIER_RANK = { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 };
export const TIER_LABELS = { bronze: 'Bronze', silver: 'Argent', gold: 'Or', platinum: 'Platine', diamond: 'Diamond' };

export const tierOf = (packKey) => PACK_KEY_TIER[packKey] || 'bronze';
export const tierRank = (packKey) => TIER_RANK[tierOf(packKey)] || 1;
