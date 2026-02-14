import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import crypto from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.CATEGORIES_TABLE;

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
        // GET /categories
        if (httpMethod === 'GET' && !id) {
            const command = new ScanCommand({ TableName: TABLE_NAME });
            const response = await docClient.send(command);
            console.log(`Returned ${response.Items?.length || 0} categories`);
            return {
                statusCode: 200,
                headers: getHeaders(),
                body: JSON.stringify(response.Items || [])
            };
        }

        // GET /categories/{id}
        if (httpMethod === 'GET' && id) {
            const command = new GetCommand({ TableName: TABLE_NAME, Key: { id } });
            const response = await docClient.send(command);
            if (!response.Item) {
                return { statusCode: 404, headers: getHeaders(), body: JSON.stringify({ message: "Category not found" }) };
            }
            return {
                statusCode: 200,
                headers: getHeaders(),
                body: JSON.stringify(response.Item)
            };
        }

        // POST /categories
        if (httpMethod === 'POST') {
            const body = JSON.parse(event.body || "{}");
            console.log("Creating category:", body);

            if (!body.name) {
                return { statusCode: 400, headers: getHeaders(), body: JSON.stringify({ message: "Name is required" }) };
            }

            const newCategory = {
                id: crypto.randomUUID(),
                name: body.name,
                description: body.description || "",
                createdAt: new Date().toISOString()
            };

            await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: newCategory }));
            console.log("Category created:", newCategory.id);

            return {
                statusCode: 201, // 201 Created
                headers: getHeaders(),
                body: JSON.stringify(newCategory)
            };
        }

        // PUT /categories/{id}
        if (httpMethod === 'PUT' && id) {
            const body = JSON.parse(event.body || "{}");

            const getCmd = new GetCommand({ TableName: TABLE_NAME, Key: { id } });
            const current = await docClient.send(getCmd);
            if (!current.Item) {
                return { statusCode: 404, headers: getHeaders(), body: JSON.stringify({ message: "Category not found" }) };
            }

            const updatedCategory = {
                ...current.Item,
                ...body,
                id,
                updatedAt: new Date().toISOString()
            };

            await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: updatedCategory }));

            return {
                statusCode: 200,
                headers: getHeaders(),
                body: JSON.stringify(updatedCategory)
            };
        }

        // DELETE /categories/{id}
        if (httpMethod === 'DELETE' && id) {
            await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }));
            return {
                statusCode: 200,
                headers: getHeaders(),
                body: JSON.stringify({ message: "Category deleted" })
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
