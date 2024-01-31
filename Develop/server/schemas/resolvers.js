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
        createUser: async (_, args) => {
            const user = await User.create(args);

            if (!user) {
                throw new Error('Something is wrong');
            }

            const token = signToken(user);
            return { token, user };
        },

        //Resolver for logging in a user
        login: async(_, { username, email, password }) => {
            const user = await User.findOne({ $or: [{ username }, { email }]  });

            if (!user) {
                throw new Error('Cannot find user');
            }

            const correctPw = await user.isCorrectPassword(passowrd);

            if (!correctPw) {
                throw new Error('Wrong password!');
            }

            const token = signToken(user);
            return { token, user };
        },
        
    }
}