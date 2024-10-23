import User from "../models/User";

// Function to generate a random 6-character alphanumeric code
const generateFriendCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let friendCode = '';
    for (let i = 0; i < 6; i++) {
        friendCode += chars[Math.floor(Math.random() * chars.length)];
    }
    return friendCode;
};

// Function to generate a unique friend code by checking the database
export const generateUniqueFriendCode = async (): Promise<string> => {
    let friendCode: string;
    let existingUser: typeof User | null;

    // Loop until a unique friend code is found
    do {
        friendCode = generateFriendCode();
        existingUser = await User.findOne({ friendCode });
    } while (existingUser);

    return friendCode;
};
