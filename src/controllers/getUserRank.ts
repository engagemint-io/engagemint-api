import { Request, Response } from 'express';

const getUserRank = async (req: Request, res: Response) => {
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
    // Get twitter_id from twitter access token

    // Query db for user rank
    // Might need to scan the db for this

    return res.status(200).send({
      status: 'success',
      data: {
        // Return data here
      }
    });
  } catch (error) {
    res
      .status(200)
      .send({ verified: false, error: 'Error fetching user rank!' });
  }
};

export default getUserRank;
