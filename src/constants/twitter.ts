import { ChainId } from './chains';

export type TwitterCallbackUrl = {
  [chainId in ChainId]: string;
};

export const TWITTER_CALLBACK_URL: TwitterCallbackUrl = {
  'sei-devnet-3': 'https://www.seinetwork.io/treasure?page=Claim',
  'atlantic-2': 'https://www.seinetwork.io/treasure?page=Claim'
};

export const SEI_TWITTER_ID = '1515104342906327045';
