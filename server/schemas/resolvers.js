const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        //Resolver for getting a single user
        getSingleUser: async (_, args, context) => {
            if (!context.user) {
                throw new Error('Not authenticated');
            }

            const foundUser = await User.findOne({
                $or: [{ _id: context.user ? context.user._id : args.id }, {username: args.username }],
            });

            if (!foundUser) {
                throw new Error('Cannot find user with this Id');
            }

            return foundUser;
        },
    },
    Mutation: {
        //Resolver for creating a user
        addUser: async (_, args) => {
            try {
                const user = await User.create(args);
        
                // Assuming User.create returns null if user can't be created
                // which is uncommon. Usually, it throws an error.
                if (!user) {
                    throw new Error('User creation failed');
                }
        
                const token = signToken(user);
                return { token, user };
            } catch (error) {
                // Log the detailed error for debugging purposes
                console.error("Error in createUser resolver:", error);
        
                // Throw a more user-friendly error message
                // or handle specific known error cases (like duplicate email)
                if (error.code === 11000) {
                    // Handle duplicate key error (e.g., email already exists)
                    throw new Error('User with this email already exists');
                } else {
                    // For other errors, you can send a generic message
                    // or based on the environment, send detailed messages
                    throw new Error('Error creating user');
                }
            }
        },

        //Resolver for logging in a user
        login: async(_, { username, email, password }) => {
            const user = await User.findOne({ $or: [{ username }, { email }]  });

            if (!user) {
                throw new Error('Cannot find user');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new Error('Wrong password!');
            }

            const token = signToken(user);
            return { token, user };
        },

        //Resolver for saving a book
        saveBook: async (_, { bookData }, context) => {
            if (!context.user) {
                throw new Error('Not Authenticated');
            }

            const updatedUser = await User.findOneandUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: bookData } },
                { new: true, runValidators: true }
            );

            if (!updatedUser) {
                throw new Error('Error saving Book');
            }
            return updatedUser;
        },

        //Resolver for deleting a book
        removeBook: async (_, { bookId }, context) => {
            if (!context.user) {
                throw new Error('Not Authenticated');
            }

            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId} } },
                { new: true }
            );

            if (!updatedUser) {
                throw new Error("Can't find user with this Id")
            }

            return updatedUser;
        },
    },
};

module.exports = resolvers;