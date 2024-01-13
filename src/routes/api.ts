import { Router } from 'express';
import {
  getTwitterLogin,
  registerUser,
  getUserRank,
  getLeaderboard
} from '../controllers';

const apiRouter = Router();

// Get twitter login credentials
apiRouter.get('/twitter-login', getTwitterLogin);

// Return the leaderboard for a given ticker
apiRouter.get('/leaderboard', getLeaderboard);

// Return the users position on the leaderboard
apiRouter.get('/leaderboard/:id', getUserRank);

// Register a twitter account with a ticker
apiRouter.post('/register', registerUser);

export default apiRouter;
