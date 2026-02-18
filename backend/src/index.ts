import express,  { Request, Response } from 'express';

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.json({ status: "Server is running." });
})

app.listen(4000, () => {
    console.log("Server running on http://localhost:4000");
});
