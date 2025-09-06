const app = require('./server');
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`🚔 POLIS Server running on port ${PORT}`);
    console.log(`📱 Frontend available at: http://localhost:${PORT}`);
    console.log(`🔗 API available at: http://localhost:${PORT}/api`);
});
