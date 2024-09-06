import express from 'express';
const app = express();

const express = require('express');  // CommonJS import
module.exports = app;

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
