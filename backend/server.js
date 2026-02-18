const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: "Server is running." });
})

app.listen(4000, () => {
    console.log("Server running on http://localhost:4000");
});
