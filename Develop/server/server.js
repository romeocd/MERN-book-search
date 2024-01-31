const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const db = require('./config/connection');

// Import your typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');

// Import the updated authMiddleware
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Set up Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // Use the authMiddleware to add user info to the context
    const user = await authMiddleware({ req });
    return { user };
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Start Apollo Server
const startApolloServer = async () => {
  await server.start();

  // Apply Apollo Server middleware
  server.applyMiddleware({ app });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
  }

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
};

// Call the function to start the server
startApolloServer();