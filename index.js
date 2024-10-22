const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { graphqlUploadExpress } = require('graphql-upload');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { getUserFromToken } = require('./utils/auth');

const startServer = async () => {
    const app = express();

    app.use(graphqlUploadExpress());

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: true,
        playground: true,
        context: ({ req }) => {
            const token = req.headers.authorization || '';
            const user = getUserFromToken(token.replace('Bearer ', ''));
            return { user };
        }
    });

    await server.start();
    server.applyMiddleware({ app });

    app.listen({ port: 4000, host: '0.0.0.0' }, () => {
        console.log(`🚀 Servidor listo en http://localhost:4000${server.graphqlPath}`);
    });
};

startServer();