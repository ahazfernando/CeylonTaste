export const handler = async (event) => {
    const products = [
        { id: "1", name: "Classic Burger", price: 9.99 },
        { id: "2", name: "Cheese Fries", price: 4.99 },
        { id: "3", name: "Vanilla Shake", price: 5.49 }
    ];

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(products),
    };
};
