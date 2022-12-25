import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import {
  AdminCreateUserRequest,
  AdminInitiateAuthRequest,
  AdminSetUserPasswordRequest,
} from "aws-sdk/clients/cognitoidentityserviceprovider";

import { validateInput, sendResponse } from "./functions/functions";

const cognito = new AWS.CognitoIdentityServiceProvider();
