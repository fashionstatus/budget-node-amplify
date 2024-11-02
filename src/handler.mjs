// src/handler.mjs
export const server = async (event, context) => {
    try {
      // Your logic here
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Success' }),
      };
    } catch (error) {
      console.error('Error:', error); // Log the error for debugging
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Internal Server Error' }),
      };
    }
  };
  