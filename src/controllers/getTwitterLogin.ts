import { Request, Response } from 'express';
import { TwitterApi } from 'twitter-api-v2';
import { TWITTER_CALLBACK_URL } from '../constants';
import { getSecrets } from '../utils';

const getTwitterLoginInfo = async (req: Request, res: Response) => {
  const address = req.query.address as string;
  if (!address) {
    res.status(200).send({
      status: 'fail',
      message: 'address is required'
    });
    return;
  }

  const { TWITTER_CLIENT_KEY, TWITTER_CLIENT_SECRET } = await getSecrets();
  const chainId = process.env.CHAIN_ID;
  // @ts-ignore
  const twitterCallbackUrl = TWITTER_CALLBACK_URL[chainId];

  try {
    const client = new TwitterApi({
      clientId: TWITTER_CLIENT_KEY,
      clientSecret: TWITTER_CLIENT_SECRET
    });

    // Create authentication link
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
      twitterCallbackUrl,
      { scope: ['follows.read'] }
    );

    // Store codeVerifier and state in db
    // await storeAuthState(address, codeVerifier, state);

    console.log(address, codeVerifier, state);

    res.status(200).json({
      status: 'success',
      data: {
        twitterAuthUrl: url
      }
    });
  } catch (e) {
    console.log('Error generating twitter login url', e);
    res.status(500).send({
      status: 'error',
      message: 'Error generating twitter login url'
    });
  }
};

export default getTwitterLoginInfo;
