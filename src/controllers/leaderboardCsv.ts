import { Request, Response } from 'express';
import { LeaderboardTickerEpochCompositeKey, LeaderboardModel } from '../schema';
import { StatusCodes } from 'http-status-codes';
import { parse } from 'json2csv';

const DEFAULT_QUERY_RESPONSE_LIMIT: number = parseInt(process.env.LEADERBOARD_CSV_RESPONSE_LIMIT as string) || 50;

const leaderboardCsv = async (req: Request, res: Response) => {
	const { ticker, epoch } = req.query;

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

	try {
		const tickerEpochComposite = `${epoch}#${ticker}`;

		let lastKey;
		let allResults: any[] = [];

		do {
			const query = LeaderboardModel.query(LeaderboardTickerEpochCompositeKey).eq(tickerEpochComposite).limit(DEFAULT_QUERY_RESPONSE_LIMIT);

			if (lastKey) {
				query.startAt(lastKey);
			}

			const response = await query.exec();
			allResults = [...allResults, ...response];

			lastKey = response.lastKey;
		} while (lastKey);

		// Convert the JSON response to CSV
		const csv = parse(allResults);

		// Set the response headers to indicate a file attachment
		res.attachment('leaderboard.csv');
		res.type('text/csv')
		// Send the CSV data
		return res.status(StatusCodes.OK).send(csv);
	} catch (error) {
		console.error('error', error);
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
			status: 'error',
			message: 'Error getting leaderboard for ticker.'
		});
	}
};

export default leaderboardCsv;