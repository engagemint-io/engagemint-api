import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TwitterApi } from 'twitter-api-v2';
import { LeaderboardModel, LeaderboardTickerEpochCompositeKey, LeaderboardUserAccountIdKey } from '../schema';

const userStats = async (req: Request, res: Response) => {
	const { ticker, epoch, x_access_token } = req.query;

	if (!ticker) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			status: 'fail',
			message: 'Validation: You must pass in a ticker!'
		});
	}

	if (!epoch) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			status: 'fail',
			message: 'Validation: You must pass in an epoch!'
		});
	}

	if (!x_access_token) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			status: 'fail',
			message: 'Validation: You must pass in an X (Twitter) access token!'
		});
	}

	try {
		const tickerEpochComposite = `${epoch}#${ticker}`;

		try {
			const client = new TwitterApi(x_access_token as string);
			const user: any = await client.v2.me();

			const { id } = user.data;

			const results = await LeaderboardModel.query(LeaderboardUserAccountIdKey)
				.eq(id)
				.using('UserAccountIdIndex')
				.where(LeaderboardTickerEpochCompositeKey)
				.eq(tickerEpochComposite)
				.exec();

			const userStatus = results[0];

			return res.status(StatusCodes.OK).send({
				status: 'success',
				data: {
					stats: userStatus
				}
			});
		} catch (error) {
			console.error('Error querying leaderboard by user account ID:', error);
			throw error;
		}
	} catch (error) {
		console.log('Error fetching user stats:', error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ verified: false, error: 'Error fetching user rank!' });
	}
};

export default userStats;
