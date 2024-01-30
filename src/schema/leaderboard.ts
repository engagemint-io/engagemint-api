import dynamoose from 'dynamoose';

export const LEADERBOARD_TABLE_NAME = 'engagemint-epoch_leaderboard_table';

export const LeaderboardTickerEpochCompositeKey = 'ticker_epoch_composite';
export const LeaderboardTotalPointsKey = 'total_points';
export const LeaderboardUserAccountIdKey = 'user_account_id';
export const LeaderboardViewPointsKey = 'view_points';
export const LeaderboardVideoViewPointsKey = 'video_view_points';
export const LeaderboardFavoritePointsKey = 'favorite_points';
export const LeaderboardRetweetPointsKey = 'retweet_points';
export const LeaderboardQuotePointsKey = 'quote_points';

export const LeaderboardModel = dynamoose.model(LEADERBOARD_TABLE_NAME, {
	[LeaderboardTickerEpochCompositeKey]: {
		type: String,
		hashKey: true
	},
	[LeaderboardUserAccountIdKey]: {
		type: String,
		index: {
			name: 'UserAccountIdIndex', // name of the secondary index
			// rangeKey: LeaderboardTickerEpochCompositeKey, // Uncomment if querying by range key
			project: true // Projects all attributes
		}
	},
	[LeaderboardTotalPointsKey]: Number,
	[LeaderboardViewPointsKey]: Number,
	[LeaderboardVideoViewPointsKey]: Number,
	[LeaderboardFavoritePointsKey]: Number,
	[LeaderboardRetweetPointsKey]: Number,
	[LeaderboardQuotePointsKey]: Number
});
