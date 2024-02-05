import { Request, Response } from 'express';
import { TwitterApi } from 'twitter-api-v2';
import { getSecrets } from '../utils';
import { StatusCodes } from 'http-status-codes';

const XAuthUrl = async (req: Request, res: Response) => {
	try {
		const { redirectUrl } = req.query;

		const ALLOWED_REDIRECT_URLS = [
			'http://localhost:5173/',
			'http://localhost:5173/leaderboard',
			'http://192.168.0.160:5173/',
			'http://192.168.0.160:5173/leaderboard'
		];

		if (!redirectUrl) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: 'fail',
				message: 'Validation: You must pass a redirect URL!'
			});
		}

		if (!ALLOWED_REDIRECT_URLS.includes(redirectUrl as string)) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: 'fail',
				message: 'Validation: You must pass a valid redirect URL!'
			});
		}

		const { X_CLIENT_ID, X_CLIENT_SECRET } = await getSecrets();

		if (!X_CLIENT_ID || !X_CLIENT_SECRET) {
			console.error('Error fetching x (Twitter) keys from AWS Secrets Manager');
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				status: 'error',
				message: 'Processing: Error fetching x (Twitter) keys'
			});
		}

		const client = new TwitterApi({
			clientId: X_CLIENT_ID,
			clientSecret: X_CLIENT_SECRET
		});

		const { url, codeVerifier } = client.generateOAuth2AuthLink(redirectUrl as string, {
			scope: ['tweet.read', 'users.read', 'offline.access']
		});

		res.status(StatusCodes.OK).json({
			status: 'success',
			data: {
				xAuthUrl: url,
				xCodeVerifier: codeVerifier,
				xRedirectUrl: redirectUrl
			}
		});
	} catch (e: any) {
		console.error('Error generating twitter login url', e.message);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
			status: 'fail',
			message: 'Error generating twitter login url'
		});
	}
};

export default XAuthUrl;
