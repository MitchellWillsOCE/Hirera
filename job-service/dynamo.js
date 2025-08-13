const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const REGION = process.env.AWS_REGION || 'ap-southeast-2';
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'hirera-jobs';
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || undefined;

const client = new DynamoDBClient({
  region: REGION,
  ...(DYNAMODB_ENDPOINT ? { endpoint: DYNAMODB_ENDPOINT } : {}),
});
const docClient = DynamoDBDocumentClient.from(client);

const createJob = async (userId, jobData) => {
  const jobId = uuidv4();
  const timestamp = new Date().toISOString();

  const params = {
    TableName: TABLE_NAME,
    Item: {
      userId: userId,
      jobId: jobId,
      company: jobData.company,
      title: jobData.title,
      location: jobData.location,
      url: jobData.url,
      salary: jobData.salary,
      salaryCurrency: jobData.salaryCurrency,
      contactName: jobData.contactName,
      contactEmail: jobData.contactEmail,
      contactPhone: jobData.contactPhone,
      notes: jobData.notes,
      status: jobData.status || 'APPLIED',
      tags: jobData.tags,
      applicationDate: jobData.applicationDate || timestamp,
      priority: jobData.priority || 'MEDIUM',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  try {
    await docClient.send(new PutCommand(params));
    return params.Item;
  } catch (error) {
    console.error('Error creating job in DynamoDB:', error);
    throw new Error('Could not create job.');
  }
};

const getJobsByUser = async (userId) => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  try {
    const data = await docClient.send(new QueryCommand(params));
    return data.Items;
  } catch (error) {
    console.error('Error getting jobs from DynamoDB:', error);
    throw new Error('Could not retrieve jobs.');
  }
};

const getJobById = async (userId, jobId) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      userId: userId,
      jobId: jobId,
    },
  };

  try {
    const data = await docClient.send(new GetCommand(params));
    return data.Item;
  } catch (error) {
    console.error('Error getting job by ID from DynamoDB:', error);
    throw new Error('Could not retrieve job.');
  }
};

const updateJob = async (userId, jobId, jobData) => {
  const timestamp = new Date().toISOString();
  
  // Remove keys that are part of the key schema
  const { userId: uid, jobId: jid, ...updateData } = jobData;

  let updateExpression = 'set ';
  const expressionAttributeValues = { ':updatedAt': timestamp };
  const expressionAttributeNames = { '#updatedAt': 'updatedAt' };

  // Dynamically build the update expression
  for (const [key, value] of Object.entries(updateData)) {
    if (value !== undefined) {
      const valueKey = `:${key}`;
      const nameKey = `#${key}`;
      updateExpression += `${nameKey} = ${valueKey}, `;
      expressionAttributeNames[nameKey] = key;

      // Handle tags specifically to create a String Set
      if (key === 'tags' && Array.isArray(value) && value.length > 0) {
        expressionAttributeValues[valueKey] = new Set(value);
      } else {
        expressionAttributeValues[valueKey] = value;
      }
    }
  }

  updateExpression += '#updatedAt = :updatedAt';

  const params = {
    TableName: TABLE_NAME,
    Key: { userId, jobId },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  };
  
  // If tags are an empty array, we want to remove the attribute
  if (updateData.tags && updateData.tags.length === 0) {
      params.UpdateExpression += ' REMOVE #tags';
      expressionAttributeNames['#tags'] = 'tags';
  }


  try {
    const data = await docClient.send(new UpdateCommand(params));
    return data.Attributes;
  } catch (error) {
    console.error('Error updating job in DynamoDB:', error);
    throw new Error('Could not update job.');
  }
};


module.exports = {
  createJob,
  getJobsByUser,
  getJobById,
  updateJob,
  ensureJobsTableExists: async () => {
    if (!DYNAMODB_ENDPOINT) {
      return; // Assume managed DynamoDB in AWS
    }
    try {
      // Check if table exists
      await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
      return;
    } catch (err) {
      if (err && err.name !== 'ResourceNotFoundException') {
        console.error('Error describing DynamoDB table:', err);
        throw err;
      }
    }

    console.log(`Creating DynamoDB table '${TABLE_NAME}' on local endpoint...`);
    try {
      await client.send(new CreateTableCommand({
        TableName: TABLE_NAME,
        AttributeDefinitions: [
          { AttributeName: 'userId', AttributeType: 'S' },
          { AttributeName: 'jobId', AttributeType: 'S' },
        ],
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'jobId', KeyType: 'RANGE' },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      }));
      console.log('DynamoDB table created.');
    } catch (createErr) {
      // If table already being created, ignore
      if (createErr && createErr.name !== 'ResourceInUseException') {
        console.error('Failed to create DynamoDB table:', createErr);
        throw createErr;
      }
    }
  },
}; 