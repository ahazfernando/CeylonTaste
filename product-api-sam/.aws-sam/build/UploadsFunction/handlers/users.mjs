import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.USERS_TABLE;

const getHeaders = () => ({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST"
});

export const handler = async (event) => {
    console.log("Event:", JSON.stringify(event));

    // Handle CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: getHeaders(), body: '' };
    }

    let userId;
    let userEmail;
    let userName;
    let userRole = 'user';

    // Helper to get header case-insensitively
    const getHeader = (name) => {
        if (!event.headers) return undefined;
        const key = Object.keys(event.headers).find(k => k.toLowerCase() === name.toLowerCase());
        return key ? event.headers[key] : undefined;
    };

    // 1. Try to get user info from Cognito Authorizer
    if (event.requestContext?.authorizer?.claims?.sub) {
        const claims = event.requestContext.authorizer.claims;
        userId = claims.sub;
        userEmail = claims.email;
        userName = claims.name || claims['cognito:username'] || claims.email?.split('@')[0];
    }

    // 2. Fallback: Parse from Authorization header
    const authHeader = getHeader('Authorization');
    if (!userId && authHeader) {
        try {
            const token = authHeader.replace(/^Bearer\s+/i, "");
            const parts = token.split('.');
            if (parts.length === 3) {
                // Use Buffer for reliable base64 decoding in Node
                const payloadStr = Buffer.from(parts[1], 'base64').toString('utf-8');
                const payload = JSON.parse(payloadStr);

                userId = payload.sub;
                userEmail = payload.email;
                userName = payload.name || payload['cognito:username'] || payload.email?.split('@')[0];

                const admins = ['jordan@gmail.com', 'jordan04@gmail.com', 'ahazfernando@gmail.com'];
                if (userEmail && admins.includes(userEmail.toLowerCase())) {
                    userRole = 'admin';
                }
            }
        } catch (e) {
            console.error("Failed to parse token:", e);
        }
    }

    console.log(`Resolved User: ID=${userId}, Email=${userEmail}, Role=${userRole}`);

    if (!userId) {
        return {
            statusCode: 401,
            headers: getHeaders(),
            body: JSON.stringify({ message: "Unauthorized - No identifying token found" })
        };
    }

    try {
        // List All Users (Admin) - GET /users
        if (event.httpMethod === 'GET' && event.path === '/users') {
            if (userRole !== 'admin') {
                return {
                    statusCode: 403,
                    headers: getHeaders(),
                    body: JSON.stringify({ message: "Forbidden - Admins only" })
                };
            }
            const command = new ScanCommand({ TableName: TABLE_NAME });
            const response = await docClient.send(command);
            return {
                statusCode: 200,
                headers: getHeaders(),
                body: JSON.stringify(response.Items || [])
            };
        }

        // GET /users/me
        if (event.httpMethod === 'GET') {
            const command = new GetCommand({
                TableName: TABLE_NAME,
                Key: { id: userId },
            });
            const response = await docClient.send(command);

            if (response.Item) {
                console.log("User found:", response.Item.id);
                return {
                    statusCode: 200,
                    headers: getHeaders(),
                    body: JSON.stringify(response.Item)
                };
            }

            console.log(`User ${userId} not found. Creating JIT.`);

            const newUser = {
                id: userId,
                email: userEmail || "",
                name: userName || "User",
                role: userRole,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await docClient.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: newUser,
            }));

            console.log("JIT User created successfully");

            return {
                statusCode: 200,
                headers: getHeaders(),
                body: JSON.stringify(newUser)
            };
        }

        // PUT /users/me
        if (event.httpMethod === 'PUT' || event.httpMethod === 'POST') {
            const body = JSON.parse(event.body || "{}");

            const getCommand = new GetCommand({ TableName: TABLE_NAME, Key: { id: userId } });
            const current = await docClient.send(getCommand);

            const userProfile = {
                ...(current.Item || {}),
                id: userId,
                ...body,
                updatedAt: new Date().toISOString()
            };

            if (!current.Item) {
                userProfile.createdAt = new Date().toISOString();
                if (!userProfile.role) userProfile.role = userRole;
                if (!userProfile.email && userEmail) userProfile.email = userEmail;
            }

            await docClient.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: userProfile,
            }));

            return {
                statusCode: 200,
                headers: getHeaders(),
                body: JSON.stringify(userProfile)
            };
        }

        return {
            statusCode: 405,
            headers: getHeaders(),
            body: JSON.stringify({ message: "Method not allowed" })
        };

    } catch (err) {
        console.error("Error processing request:", err);
        return {
            statusCode: 500,
            headers: getHeaders(),
            body: JSON.stringify({ message: "Internal Server Error", error: err.message })
        };
    }
};
