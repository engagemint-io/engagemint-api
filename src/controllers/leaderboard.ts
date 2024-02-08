import { Request, Response } from 'express';
import { LeaderboardTickerEpochCompositeKey, LeaderboardModel } from '../schema';
import { StatusCodes } from 'http-status-codes';

const DEFAULT_QUERY_RESPONSE_LIMIT: number = parseInt(process.env.LEADERBOARD_RESPONSE_LIMIT as string) || 50;

const leaderboard = async (req: Request, res: Response) => {
	const { ticker, epoch, limit } = req.query;

	if (!ticker) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			status: 'fail',
			message: 'Validation: You must pass a ticker!'
		});
	}

	if (!epoch) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			status: 'fail',
			message: 'Validation: You must pass an epoch!'
		});
	}

	if (isNaN(parseInt(epoch as string))) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			status: 'fail',
			message: 'Validation: Epoch must be a number!'
		});
	}

	if (limit) {
		const parsedLimit = parseInt((limit as string).replace(',', ''), 10);

		if (isNaN(parsedLimit)) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: 'fail',
				message: 'Validation: Limit must be a number!'
			});
		}

		if (parsedLimit > 200) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: 'fail',
				message: 'Validation: Limit must be less than 200!'
			});
		}
	}

	try {
		const queryResponseLimit = parseInt(limit as string) || DEFAULT_QUERY_RESPONSE_LIMIT;
		const tickerEpochComposite = `${ticker}#${epoch}`;

		const query = LeaderboardModel.query(LeaderboardTickerEpochCompositeKey).eq(tickerEpochComposite).limit(queryResponseLimit);

		const response = await query.exec();

		return res.status(StatusCodes.OK).send({
			status: 'success',
			data: response || []
		});
	} catch (error) {
		console.error('error', error);
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
			status: 'error',
			message: 'Error getting leaderboard for ticker.'
		});
	}
};

export default leaderboard;
