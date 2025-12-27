import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const REGION = process.env.NEXT_PUBLIC_COGNITO_REGION || "us-east-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
  console.warn(
    "AWS credentials not found in environment variables. The DynamoDB client will rely on the default credentials provider chain."
  );
}

const client = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
});

const docClient = DynamoDBDocumentClient.from(client);

export default docClient; 