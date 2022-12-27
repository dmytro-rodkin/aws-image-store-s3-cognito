import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { validateInput, sendResponse } from "../functions/functions";
import hash from "object-hash";
import { v4 as uuid } from "uuid";
// import * as dotenv from "dotenv";
// dotenv.config();

const cognito = new AWS.CognitoIdentityServiceProvider();
const s3 = new AWS.S3();
//AWS.config.update({ accessKeyId: "AKIAUYSFSKNNM2HWHG5J", secretAccessKey: "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" });

const bucketname = "aws-image-s3-bucket"; //process.env.bucketname;

interface emailExrtactor {
  code: number;
  email: string;
}

export const addphotopresigned = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = extractEmailFromToken(event);
    if (data.code == 0) throw Error("Email is not extracted");
    const { email } = data;
    const emailHashed = hash(email);
    const photoid = createKey(emailHashed, uuid());
    const params = s3.createPresignedPost({
      Bucket: bucketname,
      Fields: {
        key: photoid, // totally random
      },
      Expires: 600,
      Conditions: [
        ["content-length-range", 0, 1000000], // content length restrictions: 0-1MB
        //["starts-with", "$Content-Type", "image/"], // content type restriction
        ["starts-with", "$x-amz-meta-photoname", ""],
        //{ acl: "public-read" },
      ],
    });
    //params.fields["x-amz-meta-userid"] = photoid;

    return sendResponse(200, params);
  } catch (error) {
    return sendResponse(200, { message: error });
  }
};

export const showphotos = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = extractEmailFromToken(event);
    if (data.code == 0) throw Error("Email is not extracted");
    const { email } = data;
    const emailHashed = hash(email);
    const objects = await s3
      .listObjectsV2({ Bucket: <string>bucketname, Delimiter: "/", Prefix: emailHashed + "/" })
      .promise();
    const signedUrlExpireSeconds = 60 * 5;
    console.log(objects);

    const keysArray = objects.Contents?.filter((elem, index) => elem.Key?.split("/")[1] != "").map((elem) => elem.Key);
    if (typeof keysArray === "undefined") {
      throw new Error("No photos found");
    }

    const outArray = await Promise.all(
      keysArray.map(async (elem) => {
        const url = s3.getSignedUrl("getObject", {
          Bucket: <string>bucketname,
          Key: elem,
          Expires: signedUrlExpireSeconds,
        });
        const photoName = await s3
          .headObject({
            Bucket: <string>bucketname,
            Key: <string>elem,
          })
          .promise();
        const photoNameString = photoName?.Metadata?.photoname || "";
        // ObjectAttributes: ETag | Checksum | ObjectParts | StorageClass | ObjectSize | metaInfo})

        return { fileName: elem?.split("/")[1], photoName: photoNameString, url };
      }),
    );

    return sendResponse(200, { data: outArray });
  } catch (error) {
    return sendResponse(400, { message: error });
  }
};

export const deletephotos = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const uuid = getUUID(event);
    const data = extractEmailFromToken(event);
    if (data.code == 0) throw Error("Email is not extracted");
    const { email } = data;
    const emailHashed = hash(email);
    await validatePhotoExists(emailHashed, uuid);

    await s3.deleteObject({ Bucket: <string>bucketname, Key: createKey(emailHashed, uuid) }).promise();
    return sendResponse(200, { info: "Object deleted" });
  } catch (error) {
    return sendResponse(400, { message: error });
  }
};

const extractEmailFromToken = (event: APIGatewayProxyEvent): emailExrtactor => {
  try {
    return { code: 1, email: event?.requestContext?.authorizer?.claims.email };
  } catch (error) {
    return { code: 0, email: "" };
  }
};

const getUUID = (event: APIGatewayProxyEvent): string => {
  const uuid = event.pathParameters!["uuid"];

  // if uuid is non-existent throws HTTP error - bad request
  if (!uuid) {
    throw new Error("Missing UUID");
  }

  return uuid;
};

const createKey = (emailHashed: string, uuid: string): string => {
  try {
    return emailHashed + "/" + uuid + ".jpg";
  } catch (e) {
    // if head object fails we check for the error code
    throw new Error("user not found");
  }
};

const validatePhotoExists = async (emailHashed: string, uuid: string): Promise<void> => {
  try {
    const key = createKey(emailHashed, uuid);
    await s3.headObject({ Bucket: bucketname, Key: key }).promise();
  } catch (e) {
    // if head object fails we check for the error code
    throw new Error("user not found");
  }
};
