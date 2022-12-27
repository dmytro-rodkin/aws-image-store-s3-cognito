import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { AdminInitiateAuthRequest } from "aws-sdk/clients/cognitoidentityserviceprovider";

import { sendResponse } from "../functions/functions";

const cognito = new AWS.CognitoIdentityServiceProvider();

export const refresh = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.body == null) {
      throw Error("no refresh token");
    }
    const isValid = validateRefreshTokenInput(event.body);
    if (!isValid) return sendResponse(400, { message: "Invalid input" });

    const { refreshToken } = JSON.parse(event.body);
    const { user_pool_id, client_id } = process.env;
    const params = {
      AuthFlow: "REFRESH_TOKEN_AUTH",
      UserPoolId: user_pool_id,
      ClientId: client_id,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    };
    const response = await cognito.adminInitiateAuth(<AdminInitiateAuthRequest>params).promise();

    return sendResponse(200, {
      message: "Success",
      idToken: response.AuthenticationResult?.IdToken,
      //accessToken: response.AuthenticationResult?.AccessToken,
    });
  } catch (error) {
    return sendResponse(500, { error });
  }
};

const validateRefreshTokenInput = (data: string) => {
  const body = JSON.parse(data);
  const { refreshToken } = body;
  if (!refreshToken) return false;
  return true;
};
