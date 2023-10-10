import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __root = dirname(__filename);

app.use(express.static(__root));

app.get("/", (req, res) => {
	res.sendFile(join(__root, "/public/html/index.html"));
});

app.listen(3000, () => console.log("Server started on port 3000"));
