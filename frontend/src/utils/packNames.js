// Investment.pack stores the stable internal key (unchanged for backward
// compatibility with existing records); this maps it to the user-facing
// name, themed after real market indices per the ETF-diversification concept.
export const PACK_NAMES = {
  russell2000: 'Dangote Petroleum Refinery & Petrochemicals FZE',
  cac40: 'CAC 40',
  eurostoxx50: 'Euro Stoxx 50',
  ftse100: 'FTSE 100',
  nikkei225: 'Nikkei 225',
  dowjones30: 'Dow Jones 30',
  nasdaq100: 'Nasdaq 100',
  sp500: 'S&P 500',
  bund: 'Bund',
  tbonds: 'T-Bonds',
  us10y: 'US 10Y',
  turbo48h: 'Turbo 48H',
};

export const packDisplayName = (key) => PACK_NAMES[key] || key;
