# DevSentry AI Agent

An intelligent code review and cloud security agent built for the AWS Builder Center Challenge. It flags insecure IAM policies, parses architecture files, and delivers constructive, friendly feedback powered by **Amazon Bedrock (Nova / Claude)**.

## Architecture
- **Frontend:** React + Tailwind CSS (Hosted on **AWS Amplify**)
- **API Layer:** **Amazon API Gateway** (REST API with Lambda Proxy Integration)
- **Compute:** **AWS Lambda** (Python 3.12 runtime)
- **AI & Security:** **Amazon Bedrock** & **Amazon Comprehend** (PII Masking)
- **State Storage:** **Amazon DynamoDB**

## Quick Start
1. Deploy the `backend/lambda_function.py` code onto AWS Lambda with IAM permissions for Bedrock and DynamoDB.
2. Connect the Lambda function to Amazon API Gateway using a POST method.
3. Update your frontend API endpoint configuration and host the UI on AWS Amplify.
