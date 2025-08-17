const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRoutes = require('./routes/users');
const caseRoutes = require('./routes/cases');
const documentRoutes = require('./routes/documents');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 8081;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/polisproject', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Polis Project Backend API');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
