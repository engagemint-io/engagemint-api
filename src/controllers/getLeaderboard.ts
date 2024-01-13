import { Request, Response } from 'express';

const getLeaderboard = async (req: Request, res: Response) => {
  const { twitter_access_token, ticker } = req.query;
  if (!ticker) {
    return res.status(200).json({
      status: 'fail',
      message: 'Validation: You must pass a ticker!'
    });
  }
  if (!twitter_access_token) {
    return res.status(200).json({
      status: 'fail',
      message: 'Validation: You must pass a twitter access token!'
    });
  }

  try {
    // Get leaderboard for ticker
    return res.status(200).send({
      status: 'success',
      data: {
        // Return data here
      }
    });
  } catch (error) {
    console.log('error', error);
    return res.status(500).send({
      status: 'error',
      message: 'Error getting leaderboard for ticker.'
    });
  }
};

export default getLeaderboard;
