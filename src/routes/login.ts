import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { AdminInitiateAuthRequest } from "aws-sdk/clients/cognitoidentityserviceprovider";

import { validateInput, sendResponse } from "../functions/functions";

const cognito = new AWS.CognitoIdentityServiceProvider();

export const login = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.body == null) {
      throw Error("no body");
    }
    const isValid = validateInput(event.body);
    if (!isValid) return sendResponse(400, { message: "Invalid input" });

    const { email, password } = JSON.parse(event.body);
    const { user_pool_id, client_id } = process.env;
    const params = {
      AuthFlow: "ADMIN_NO_SRP_AUTH",
      UserPoolId: user_pool_id,
      ClientId: client_id,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };
    const response = await cognito.adminInitiateAuth(<AdminInitiateAuthRequest>params).promise();
    // if (typeof response === "undefined") {
    //   throw Error("Response undefined");
    // }
    return sendResponse(200, { message: "Success", token: response?.AuthenticationResult?.IdToken });
  } catch (error) {
    return sendResponse(500, { error });
  }
};
