import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import crypto from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.ORDERS_TABLE;

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
    const id = pathParameters?.id; // Note: orders might use different partition keys, let's assume 'id' or 'orderId'

    try {
        // GET /orders
        if (httpMethod === 'GET') {
            // TODO: Filter by user if not admin. For now, list all.
            const command = new ScanCommand({ TableName: TABLE_NAME });
            const response = await docClient.send(command);
            return {
                statusCode: 200,
                headers: getHeaders(),
                body: JSON.stringify(response.Items || [])
            };
        }

        // POST /orders
        if (httpMethod === 'POST') {
            const body = JSON.parse(event.body || "{}");
            console.log("Creating order:", body);

            const newOrder = {
                orderId: crypto.randomUUID(), // Ensure your table uses 'orderId' as key or adjust here
                userId: body.userId || "guest",
                ...body,
                createdAt: new Date().toISOString(),
                status: body.status || "Pending"
            };

            // Ideally, the table key in template.yaml is 'userId' (HASH) and 'createdAt' (RANGE) for the existing template?
            // Let's check template.yaml later. If it's userId/createdAt, we need to respect that.
            // IF the table schema is userId (HASH) + createdAt (RANGE), then accessing by ID is hard without GSI.
            // Let's check the current template schema in a moment. 
            // Assuming straightforward 'id' key for now or sticking to the existing definition.
            // Wait, snippet 130 showed OrdersTable with KeySchema: userId (HASH), createdAt (RANGE).
            // This is good for "Get my orders" but bad for "Get specific order by ID" or "Get all orders (Admin)".
            // For this MVP, Scan works for "Get all". 

            await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: newOrder }));

            return {
                statusCode: 201,
                headers: getHeaders(),
                body: JSON.stringify(newOrder)
            };
        }

        // PUT /orders/{id} - Update status
        if (httpMethod === 'PUT' && id) {
            // This part is tricky if the PK is userId+createdAt.
            // The frontend likely passes a simple ID.
            // If we don't change the Table schema, we can't easily update by just "ID".
            // We'll proceed assuming we might need to change schema or use scan to find it first (inefficient but works for MVP).

            // For now, let's just return 200 mock or try to scan if we really need to support update.
            // Let's assume the body has the keys needed.
            const body = JSON.parse(event.body || "{}");

            // If we have keys in body
            if (body.userId && body.createdAt) {
                const updatedOrder = {
                    ...body,
                    updatedAt: new Date().toISOString()
                };
                await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: updatedOrder }));
                return { statusCode: 200, headers: getHeaders(), body: JSON.stringify(updatedOrder) };
            }

            return { statusCode: 400, headers: getHeaders(), body: JSON.stringify({ message: "Update requires userId and createdAt keys" }) };
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
