const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const REGION = process.env.AWS_REGION || 'ap-southeast-2';
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || undefined;
const USERNAME_TABLE_NAME = process.env.USERNAME_TABLE_NAME || 'hirera-usernames';

const ddbClient = new DynamoDBClient({
  region: REGION,
  ...(DYNAMODB_ENDPOINT
    ? {
        endpoint: DYNAMODB_ENDPOINT,
        credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
      }
    : {}),
});
const docClient = DynamoDBDocumentClient.from(ddbClient);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDynamoEndpoint() {
  if (!DYNAMODB_ENDPOINT) return;
  const maxAttempts = 15;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // If endpoint is reachable, this will either succeed or throw ResourceNotFound (which is fine)
      await ddbClient.send(new DescribeTableCommand({ TableName: USERNAME_TABLE_NAME }));
      return;
    } catch (err) {
      if (err && err.name === 'ResourceNotFoundException') {
        return; // Endpoint reachable, table just doesn't exist yet
      }
      const delayMs = Math.min(500 * attempt, 3000);
      await sleep(delayMs);
    }
  }
}

async function ensureUsernameTableExists() {
  if (!DYNAMODB_ENDPOINT) return; // Assume managed table exists in AWS
  try {
    await waitForDynamoEndpoint();
    await ddbClient.send(new DescribeTableCommand({ TableName: USERNAME_TABLE_NAME }));
    return;
  } catch (err) {
    if (err && err.name !== 'ResourceNotFoundException') throw err;
  }
  await ddbClient.send(new CreateTableCommand({
    TableName: USERNAME_TABLE_NAME,
    AttributeDefinitions: [
      { AttributeName: 'username', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'username', KeyType: 'HASH' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  }));
}

async function withTableEnsureRetry(fn) {
  try {
    return await fn();
  } catch (err) {
    if (DYNAMODB_ENDPOINT && err && err.name === 'ResourceNotFoundException') {
      // Table might not yet exist; ensure and retry once
      await ensureUsernameTableExists();
      return await fn();
    }
    throw err;
  }
}

async function isUsernameAvailable(username) {
  const res = await withTableEnsureRetry(() =>
    docClient.send(new GetCommand({ TableName: USERNAME_TABLE_NAME, Key: { username } }))
  );
  return !res.Item;
}

async function reserveUsername(username, email) {
  const now = new Date().toISOString();
  await withTableEnsureRetry(() =>
    docClient.send(new PutCommand({
      TableName: USERNAME_TABLE_NAME,
      Item: { username, email, createdAt: now },
      ConditionExpression: 'attribute_not_exists(username)'
    }))
  );
}

async function releaseUsername(username) {
  await withTableEnsureRetry(() =>
    docClient.send(new DeleteCommand({ TableName: USERNAME_TABLE_NAME, Key: { username } }))
  );
}

async function getEmailByUsername(username) {
  const res = await withTableEnsureRetry(() =>
    docClient.send(new GetCommand({ TableName: USERNAME_TABLE_NAME, Key: { username } }))
  );
  return res.Item?.email || null;
}

module.exports = {
  ensureUsernameTableExists,
  isUsernameAvailable,
  reserveUsername,
  releaseUsername,
  getEmailByUsername,
  USERNAME_TABLE_NAME,
};


