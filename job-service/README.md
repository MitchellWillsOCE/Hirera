# Job Service

This microservice is responsible for managing all job application data for the Hirera platform.

## 🚀 Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**
    Create a `.env` file in this directory and add the following variables. These are required for the service to connect to AWS and validate tokens from Cognito.

    ```env
    # AWS Region
    AWS_REGION=ap-southeast-2

    # Cognito User Pool ID (for validating JWTs)
    COGNITO_USER_POOL_ID=ap-southeast-2_2crlAC0JH

    # Port for the service
    PORT=3002
    ```

3.  **Create the DynamoDB table:**
    Run the following AWS CLI command in your terminal to create the `hirera-jobs` table. Ensure your AWS CLI is configured with the necessary permissions.

    ```bash
    aws dynamodb create-table \
        --table-name hirera-jobs \
        --attribute-definitions \
            AttributeName=userId,AttributeType=S \
            AttributeName=jobId,AttributeType=S \
        --key-schema \
            AttributeName=userId,KeyType=HASH \
            AttributeName=jobId,KeyType=RANGE \
        --billing-mode PAY_PER_REQUEST
    ```
    *(Note: We use PAY_PER_REQUEST billing mode, which is more cost-effective for development and unpredictable workloads.)*

4.  **Start the service:**
    ```bash
    npm start
    ```
    The service will be running at `http://localhost:3002`. You can test it by navigating to `http://localhost:3002/health`. 