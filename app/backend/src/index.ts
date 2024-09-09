import express from 'express';
import authRoutes from './routes/auth';

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use(express.json()); // To parse JSON request bodies

app.use('/api/auth', authRoutes);

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

export default app;  // Correct ES module export