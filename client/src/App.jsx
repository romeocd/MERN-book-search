import './App.css';
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

//import Apollo provider
import { 
  ApolloClient, 
  InMemoryCache, 
  ApolloProvider, 
  createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

//main GraphQL endpoint
const httpLink = createHttpLink({
  uri: 'http://localhost:3001/graphql', 
});

//request middleware that attaches JWT token to all request as an 'authorization' header
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

//execute 'authLink' middleware before making request to GraphQL API
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div>
      <Navbar />
      <Outlet />
      </div>
    </ApolloProvider>
  );
}

export default App;
