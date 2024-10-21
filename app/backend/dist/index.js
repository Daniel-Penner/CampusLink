"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Set the strictQuery option to suppress warnings
mongoose_1.default.set('strictQuery', false);
// Connect to MongoDB
const databaseUrl = process.env.DATABASE_URL || 'mongodb://root:rootpassword@mongo:27017/campuslink_db?authSource=admin';
mongoose_1.default.connect(databaseUrl)
    .then(() => {
    console.log('Connected to MongoDB');
})
    .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
});
app.use(express_1.default.json());
// Your routes go here
const auth_1 = __importDefault(require("./routes/auth"));
const direct_messages_1 = __importDefault(require("./routes/direct-messages"));
app.use('/api/auth', auth_1.default);
app.use('/api/direct-messages', direct_messages_1.default);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
