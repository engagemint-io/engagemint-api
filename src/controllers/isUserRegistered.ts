import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RegisteredUsersModel, RegisteredUserTickerKey, RegisteredUserTwitterIdKey } from '../schema';

const isUserRegistered = async (req: Request, res: Response) => {
	try {
		const { ticker, x_user_id } = req.query;

		if (!ticker) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: 'fail',
				message: 'Validation: You must pass in a ticker!'
			});
		}

		if (!x_user_id) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: 'fail',
				message: 'Validation: You must pass in an X (Twitter) user id!'
			});
		}

		const results = await RegisteredUsersModel.query(RegisteredUserTickerKey).eq(ticker).where(RegisteredUserTwitterIdKey).eq(x_user_id).exec();

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
