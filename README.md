# E-Commerce API

This repository contains the backend code for an e-commerce website's API built with Node.js, Express.js, and MongoDB. The API provides endpoints for users to perform CRUD (Create, Read, Update, Delete) operations on products and orders. 

## Getting Started

To get started with the project, follow the instructions below:

1. Clone the repository: 
```
git clone https://github.com/gupta123shivam/E-Commerce-API.git
```


2. Install the dependencies:
```
npm install
```


3. Create a `.env` file in the root directory of the project and add the required environment variables:

```
PORT=<port number>
MONGO_URI=<MongoDB connection string>
JWT_SECRET=<secret key for JWT>
```


4. Start the development server:
```
npm run dev
```


5. Use an API testing tool such as Postman or Insomnia to test the endpoints.

## Endpoints

The following endpoints are available in the API:

- `/api/products`:
-  `GET`: get all products
-  `POST`: create a new product
- `/api/products/:id`:
-  `GET`: get a single product by ID
-  `PUT`: update a product by ID
-  `DELETE`: delete a product by ID
- `/api/orders`:
-  `GET`: get all orders
-  `POST`: create a new order
- `/api/orders/:id`:
-  `GET`: get a single order by ID
-  `PUT`: update an order by ID
-  `DELETE`: delete an order by ID

## Authentication

The API uses JSON Web Tokens (JWT) for authentication. To access the protected endpoints, you must include a valid JWT in the Authorization header of your request. To obtain a JWT, send a ```POST``` request to the ```/api/users/login``` endpoint with a valid username and password. The response will include a JWT that you can use to access the protected endpoints.


## Error Handling

The API uses custom error handlers to provide informative error messages in case of errors. If an error occurs, the API will return a JSON response with a descriptive error message.


## Contributing

Contributions to the project are welcome. To contribute, fork the repository and create a pull request with your changes. Before submitting a pull request, make sure that your changes pass the linting and testing checks.

## License
This project is licensed under the MIT License - see the ```LICENSE.md``` file for details.
