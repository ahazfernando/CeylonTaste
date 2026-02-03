import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import crypto from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.PRODUCTS_TABLE;

const getHeaders = () => ({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
});

export const handler = async (event) => {
    console.log("Event:", JSON.stringify(event));

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: getHeaders(), body: '' };
    }

    const { httpMethod, pathParameters } = event;
    const id = pathParameters?.id;

    try {
        // GET /products
        if (httpMethod === 'GET' && !id) {
            const command = new ScanCommand({ TableName: TABLE_NAME });
            const response = await docClient.send(command);
            return {
                statusCode: 200,
                headers: getHeaders(),
                body: JSON.stringify(response.Items || [])
            };
        }

        // GET /products/{id}
        if (httpMethod === 'GET' && id) {
            const command = new GetCommand({ TableName: TABLE_NAME, Key: { id } });
            const response = await docClient.send(command);
            if (!response.Item) {
                return { statusCode: 404, headers: getHeaders(), body: JSON.stringify({ message: "Product not found" }) };
            }
            return {
                statusCode: 200,
                headers: getHeaders(),
                body: JSON.stringify(response.Item)
            };
        }

        // POST /products
        if (httpMethod === 'POST') {
            const body = JSON.parse(event.body || "{}");
            if (!body.name) {
                return { statusCode: 400, headers: getHeaders(), body: JSON.stringify({ message: "Name is required" }) };
            }

            const newProduct = {
                id: crypto.randomUUID(),
                ...body,
                createdAt: new Date().toISOString()
            };

            await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: newProduct }));

            return {
                statusCode: 201,
                headers: getHeaders(),
                body: JSON.stringify(newProduct)
            };
        }

        // PUT /products/{id}
        if (httpMethod === 'PUT' && id) {
            const body = JSON.parse(event.body || "{}");
            const getCmd = new GetCommand({ TableName: TABLE_NAME, Key: { id } });
            const current = await docClient.send(getCmd);

            if (!current.Item) {
                return { statusCode: 404, headers: getHeaders(), body: JSON.stringify({ message: "Product not found" }) };
            }

            const updatedProduct = {
                ...current.Item,
                ...body,
                id,
                updatedAt: new Date().toISOString()
            };

            await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: updatedProduct }));

            return {
                statusCode: 200,
                headers: getHeaders(),
                body: JSON.stringify(updatedProduct)
            };
        }

        // DELETE /products/{id}
        if (httpMethod === 'DELETE' && id) {
            await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }));
            return {
                statusCode: 200,
                headers: getHeaders(),
                body: JSON.stringify({ message: "Product deleted" })
            };
        }

        return {
            statusCode: 405,
            headers: getHeaders(),
            body: JSON.stringify({ message: "Method not allowed" })
        };

    } catch (err) {
        console.error("Error:", err);
        return {
            statusCode: 500,
            headers: getHeaders(),
            body: JSON.stringify({ message: "Internal Server Error", error: err.message })
        };
    }
};
