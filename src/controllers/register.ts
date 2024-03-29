import { Request, Response } from 'express';
import { TwitterApi } from 'twitter-api-v2';
import { StatusCodes } from 'http-status-codes';

import { RegisteredUsersModel, RegisteredUserTwitterIdKey, RegisteredUserTickerKey, ProjectConfigModel, ProjectConfigTickerKey } from '../schema';
import { getSecrets, verifySignature } from '../utils';

const register = async (req: Request, res: Response) => {
	const { authorization } = req.headers;
	const { ticker, signature, sei_wallet_address } = req.body;

	const x_access_token = (authorization as string)?.split('Bearer ')[1];

	if (!ticker) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			status: 'fail',
			message: 'Validation: You must pass a ticker!'
		});
	}

	if (!x_access_token) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			status: 'fail',
			message: 'Validation: You must pass an X (Twitter) access token!'
		});
	}

	if (!signature) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			status: 'fail',
			message: 'Validation: You must pass a signature!'
		});
	}

	if (!sei_wallet_address) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			status: 'fail',
			message: 'Validation: You must pass a Sei wallet address!'
		});
	}

	const { X_API_KEY, X_API_SECRET } = await getSecrets();

	if (!X_API_KEY || !X_API_SECRET) {
		console.error('Error fetching x (Twitter) keys from AWS Secrets Manager');
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			status: 'error',
			message: 'Processing: Error fetching x (Twitter) keys'
		});
	}

	try {
		const parsedSignature = JSON.parse(Buffer.from(signature as string, 'base64').toString('utf-8'));

		//First, verify the signature
		const isValidSignature = await verifySignature(
			String(sei_wallet_address),
			`Registering for ${ticker} with wallet ${String(sei_wallet_address)}`,
			parsedSignature
		);

		if (!isValidSignature) {
			return res.status(StatusCodes.FORBIDDEN).send({ status: 'fail', reason: 'Forbidden, invalid signature!' });
		}

		const client = new TwitterApi(x_access_token as string);
		const user: any = await client.v2.me();

		const { id } = user.data;

		// Query db for user
		const results = await RegisteredUsersModel.query(RegisteredUserTickerKey).eq(ticker).where(RegisteredUserTwitterIdKey).eq(id).exec();

		// If user exists, return error
		if (results && results.length > 0) {
			return res.status(StatusCodes.FORBIDDEN).send({
				status: 'fail',
				message: 'User already registered!'
			});
		}

		// X (Twitter) pre-defined tweet verification
		const projectConfigResponse = await ProjectConfigModel.query(ProjectConfigTickerKey).eq(ticker).limit(1).exec();

		if (projectConfigResponse.length === 0) {
			return res.status(StatusCodes.BAD_REQUEST).send({
				status: 'fail',
				message: 'Project not found!'
			});
		}

		const projectConfig = projectConfigResponse[0];
		const { pre_defined_tweet_text } = projectConfig;

		const tweetsResponse = await client.v2.search({ query: `"${pre_defined_tweet_text}"` });
		const tweets = tweetsResponse.tweets;
		if (!tweets || tweets.length === 0) {
			return res.status(StatusCodes.FORBIDDEN).send({
				status: 'fail',
				message: 'User has not tweeted the required tweet!'
			});
		}

		// Create user row
		const newUser = new RegisteredUsersModel({
			ticker: ticker,
			twitter_id: id,
			sei_wallet_address
		});

		await newUser.save();

		return res.status(StatusCodes.OK).send({
			status: 'success',
			data: {
				message: 'User successfully registered!',
				user: newUser
			}
		});
	} catch (error: any) {
		console.log('Error in /register endpoint', error.message);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ verified: false, error: 'Error registering user!' });
	}
};

export default register;
