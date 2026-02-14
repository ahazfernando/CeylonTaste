exports.handler = async (event) => {
    const products = [
        { id: 101, name: "Wireless Headphones", price: 99.99 },
        { id: 102, name: "Smart Watch", price: 199.99 },
        { id: 103, name: "Bluetooth Speaker", price: 49.99 }
    ];

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", // CORS header
            "Access-Control-Allow-Methods": "GET, OPTIONS"
        },
        body: JSON.stringify(products),
    };
};
