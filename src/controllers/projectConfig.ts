import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ProjectConfigModel, ProjectConfigTickerKey } from '../schema';

const getProjectConfig = async (req: Request, res: Response) => {
	const { ticker } = req.query;

	if (!ticker) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			status: 'fail',
			message: 'Validation: You must pass a ticker!'
		});
	}

	try {
		const query = ProjectConfigModel.query(ProjectConfigTickerKey).eq(ticker).limit(1);

		const response = await query.exec();

		if (!response) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				status: 'fail',
				message: 'Validation: No ticker found!'
			});
		}

		return res.status(StatusCodes.OK).send({
			status: 'success',
			data: response || []
		});
	} catch (error) {
		console.error('error', error);
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
			status: 'error',
			message: 'Error getting project configuration.'
		});
	}
};

export default getProjectConfig;
