import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TwitterApi } from 'twitter-api-v2';
import { RegisteredUsersModel, RegisteredUserTickerKey, RegisteredUserTwitterIdKey } from '../schema';

const isUserRegistered = async (req: Request, res: Response) => {
	const { ticker, x_access_token } = req.query;

	if (!ticker) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			status: 'fail',
			message: 'Validation: You must pass in a ticker!'
		});
	}

	if (!x_access_token) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			status: 'fail',
			message: 'Validation: You must pass in an X (Twitter) access token!'
		});
	}

	try {
		const client = new TwitterApi(x_access_token as string);
		const user: any = await client.v2.me();

		const { id } = user.data;

		const results = await RegisteredUsersModel.query(RegisteredUserTickerKey).eq(ticker).where(RegisteredUserTwitterIdKey).eq(id).exec();

		return res.status(StatusCodes.OK).send({
			status: 'success',
			data: {
				isRegistered: results.length > 0
			}
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ verified: false, error: 'Error fetching user!' });
	}
};

export default isUserRegistered;
