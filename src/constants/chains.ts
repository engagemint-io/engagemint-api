export type Config = {
  rpcUrl: string;
  contractAddr: string;
};

export type ChainConfigs = {
  'sei-devnet-3': Config;
  'atlantic-2': Config;
};

export type ChainId = keyof ChainConfigs;
