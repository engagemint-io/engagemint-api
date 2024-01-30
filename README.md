# EngageMint API
## Description
An API for EngageMint that runs on AWS API Gateway v2 and Lambda.

This project is meant to be a the catch all lambda handler for the EngageMint api. It is an express server that runs inside the lambda function and routes the requests that way. It is deployed through a separate `engagemint-infra` project, but has github actions and yarn scripts to build and upload a binary to AWS s3.

## Local Development
Run `yarn dev` to start the express server locally. This will start the server on port 3001.

## Testing routes
This project has a postman json export in it for you to quickly test all the routes.

## Configuration
Create a file .env.local at the root of the project and add the variables outlined in the .env.sample file.

## Deployment
This project has auto deployment through github, so simply create a PR into main and this will rebuild. If you want to build and upload to AWS s3, you can run `yarn upload`
