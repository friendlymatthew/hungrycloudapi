const db = require("./db");
const {
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");

const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const getGrain = async (event) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ postId: event.pathParameters.grainId }),
    };
    const { Item } = await db.send(new GetItemCommand(params));

    console.log({ Item });
   
    response.body = JSON.stringify({
      message: "Successfully retrieved grain",
      data: Item ? unmarshall(Item) : {},
      rawData: Item,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to get grain",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

const createGrain = async (event) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };

  try {
    const body = JSON.parse(event.body);
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(body || {}),
    };
    const createResult = await db.send(new PutItemCommand(params));

    response.body = JSON.stringify({
      message: "Successfully created grain",
      createResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to create grain",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

const deleteGrain = async (event) => {
    const response = { 
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        }
      };

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ grainId: event.pathParameters.grainId }),
    };
    const deleteResult = await db.send(new DeleteItemCommand(params));

    response.body = JSON.stringify({
      message: "Successfully deleted grain",
      deleteResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to delete grain",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

module.exports = {
  getGrain,
  createGrain,
  deleteGrain,
};
