import { Request, Response } from 'express';
import { LeaderboardTickerEpochCompositeKey, LeaderboardModel, ProjectConfigModel, ProjectConfigTickerKey, AdminWalletAddressKey } from '../schema';
import { StatusCodes } from 'http-status-codes';
import { parse } from 'json2csv';
import { verifySignature } from '../utils';

const DEFAULT_QUERY_RESPONSE_LIMIT: number = parseInt(process.env.LEADERBOARD_CSV_RESPONSE_LIMIT as string) || 50;

const leaderboardCsv = async (req: Request, res: Response) => {
	const { ticker, epoch, signature } = req.query;

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

	if (!signature) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			status: 'fail',
			message: 'Validation: You must pass a signature!'
		});
	}

	// Get the admin wallet address from the database
	const query = ProjectConfigModel.query(ProjectConfigTickerKey).eq(ticker).limit(1);

	const configResponse = await query.exec();
	const adminWalletAddress = configResponse[0][AdminWalletAddressKey];

	const parsedSignature = JSON.parse(Buffer.from(signature as string, 'base64').toString('utf-8'));

	//First, verify the signature to ensure that the request is coming from the project admin
	const isValidSignature = await verifySignature(adminWalletAddress, `Requesting $${ticker} leaderboard download for epoch ${epoch}`, parsedSignature);

	if (!isValidSignature) {
		return res.status(StatusCodes.FORBIDDEN).send({ status: 'fail', reason: 'Signature is invalid.' });
	}

	// Verify that the ticker belongs to the user
	const configTicker = configResponse[0][ProjectConfigTickerKey];
	if (configTicker !== ticker) {
		return res.status(StatusCodes.UNAUTHORIZED).send({ status: 'fail', reason: 'Unauthorized to access ticker.' });
	}

	try {
		const tickerEpochComposite = `${ticker}#${epoch}`;

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

		if (allResults.length == 0) {
			return res.status(StatusCodes.OK).send({ status: 'success', reason: `No leaderboard items found for $${ticker} and epoch ${epoch}.` });
		}
		// Convert the JSON response to CSV
		const csv = parse(allResults);

		// Set the response headers to indicate a file attachment
		res.attachment(`$${ticker}-${epoch}.csv`);
		res.type('text/csv');

		return res.status(StatusCodes.OK).send(csv);
	} catch (error) {
		console.error('error', error);
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
			status: 'error',
			message: `Error downloading leaderboard for ${ticker}.`
		});
	}
};

export default leaderboardCsv;
