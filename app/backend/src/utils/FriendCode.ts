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

    do {
        friendCode = generateFriendCode();
        console.log(`Generated Friend Code: ${friendCode}`);  // Add a log to see the generated code
        existingUser = await User.findOne({ friendCode });
        if (existingUser) {
            console.log(`Friend Code ${friendCode} already exists, generating a new one.`);
        }
    } while (existingUser);

    console.log(`Unique Friend Code found: ${friendCode}`);
    return friendCode;
};
