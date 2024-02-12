import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { LeaderboardModel, LeaderboardTickerEpochCompositeKey, LeaderboardUserAccountIdKey } from '../schema';

const userStats = async (req: Request, res: Response) => {
	try {
		const { ticker, epoch, x_user_id } = req.query;

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

		if (!x_user_id) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: 'fail',
				message: 'Validation: You must pass in an X (Twitter) user id!'
			});
		}

		const tickerEpochComposite = `${ticker}#${epoch}`;

		const results = await LeaderboardModel.query(LeaderboardUserAccountIdKey)
			.eq(x_user_id)
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
		console.log('Error fetching user stats:', error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ verified: false, error: 'Error fetching user rank!' });
	}
};

export default userStats;
