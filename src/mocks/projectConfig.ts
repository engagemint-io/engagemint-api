export const MockProjectConfig = {
	ticker: 'CLIFF',
	admin_wallet_address: 'sei1lvcfcdf34ty8w79zlxkxd2v69kqna78xzgmjjh',
	epoch_length_days: 7,
	epoch_start_date: '2021-01-01T00:00:00.000Z',
	epoch_start_date_utc: '2024-01-29T00:00:00+00:00',
	view_multiplier: 1,
	like_multiplier: 50,
	video_view_multiplier: 2,
	retweet_multiplier: 100,
	quote_multiplier: 150,
	reply_multiplier: 75,
	pre_defined_tweet_text: 'Big. Red. Dog.. $CLIFF'
};

export const MockProjectConfigOtherTicker = {
	ticker: 'OTHER',
	admin_wallet_address: 'sei1lvcfcdf34ty8w79zlxkxd2v69kqna78xzgmjjh',
	epoch_length_days: 7,
	epoch_start_date: '2021-01-01T00:00:00.000Z',
	epoch_start_date_utc: '2024-01-29T00:00:00+00:00',
	view_multiplier: 1,
	like_multiplier: 50,
	video_view_multiplier: 2,
	retweet_multiplier: 100,
	quote_multiplier: 150,
	reply_multiplier: 75,
	pre_defined_tweet_text: 'Big. Red. Dog.. $CLIFF'
};

export const MockInvalidProjectConfig = {
	ticker: 'CLIFFORD',
	admin_wallet_address: '0x123',
	epoch_length_days: -7,
	epoch_start_date: '0021-01-01T00:00:00.000Z',
	epoch_start_date_utc: '0024-01-29T00:00:00+00:00',
	view_multiplier: -1,
	like_multiplier: ['array'],
	video_view_multiplier: 'string',
	retweet_multiplier: 0,
	quote_multiplier: NaN,
	reply_multiplier: null,
	pre_defined_tweet_text: undefined
};

export const MockProjectConfigWithInvalidAdminWallet = {
	ticker: 'CLIFF',
	admin_wallet_address: 'sei1lvcfcdf34ty8w79zlxkxd2v69kqna7',
	epoch_length_days: 7,
	epoch_start_date: '2021-01-01T00:00:00.000Z',
	epoch_start_date_utc: '2024-01-29T00:00:00+00:00',
	view_multiplier: 1,
	like_multiplier: 50,
	video_view_multiplier: 2,
	retweet_multiplier: 100,
	quote_multiplier: 150,
	reply_multiplier: 75,
	pre_defined_tweet_text: 'Big. Red. Dog.. $CLIFF'
};
