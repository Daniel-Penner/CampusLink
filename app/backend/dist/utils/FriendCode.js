"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueFriendCode = void 0;
const User_1 = __importDefault(require("../models/User"));
// Function to generate a random 6-character alphanumeric code
const generateFriendCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let friendCode = '';
    for (let i = 0; i < 6; i++) {
        friendCode += chars[Math.floor(Math.random() * chars.length)];
    }
    return friendCode;
};
// Function to generate a unique friend code by checking the database
const generateUniqueFriendCode = async () => {
    let friendCode;
    let existingUser;
    do {
        friendCode = generateFriendCode();
        console.log(`Generated Friend Code: ${friendCode}`); // Add a log to see the generated code
        existingUser = await User_1.default.findOne({ friendCode });
        if (existingUser) {
            console.log(`Friend Code ${friendCode} already exists, generating a new one.`);
        }
    } while (existingUser);
    console.log(`Unique Friend Code found: ${friendCode}`);
    return friendCode;
};
exports.generateUniqueFriendCode = generateUniqueFriendCode;
