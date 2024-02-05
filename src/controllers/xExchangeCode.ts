import { Request, Response } from 'express';
import { TwitterApi } from 'twitter-api-v2';
import { getSecrets } from '../utils';
import { StatusCodes } from 'http-status-codes';

const XExchangeCode = async (req: Request, res: Response) => {
	try {
		const { code, codeVerifier, redirectUri } = req.body;

		if (!code) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: 'fail',
				message: 'Validation: You must pass a code!'
			});
		}

		if (!codeVerifier) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: 'fail',
				message: 'Validation: You must pass a code verifier!'
			});
		}

		if (!redirectUri) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: 'fail',
				message: 'Validation: You must pass a redirect URI!'
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

		const LoginResponse = await client.loginWithOAuth2({ codeVerifier, redirectUri, code });
		const { accessToken, expiresIn } = LoginResponse;

		const userClient = new TwitterApi(accessToken);
		const user: any = await userClient.v2.me({
			'user.fields': ['profile_image_url']
		});

		const { profile_image_url } = user.data;

		res.status(StatusCodes.OK).json({
			status: 'success',
			data: {
				xAccessToken: accessToken,
				expiresIn,
				profileImageUrl: profile_image_url
			}
		});
	} catch (e: any) {
		console.error(e);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
			status: 'fail',
			message: 'Error exchanging twitter code.'
		});
	}
};

export default XExchangeCode;
