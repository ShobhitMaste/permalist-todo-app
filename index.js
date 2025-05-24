import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  password: process.env.PASSWORD,
  host: "localhost",
  database: "permalist",
  port: 5432
});

db.connect(); 

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async (req, res) => {
  let list = await db.query("select * from list");
  list = list.rows;
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: list,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  items.push({ title: item });
  await db.query("insert into list (title) values ($1)", [item]);
  res.redirect("/");
});

app.post("/edit",async (req, res) => {
  const id = req.body.updatedItemId;
  const newTitle = req.body.updatedItemTitle;
  await db.query("update list set title = $1 where id = $2;" , [newTitle, id]);
  res.redirect("/");
});

app.post("/delete", async(req, res) => {
  const id = req.body.deleteItemId
  await db.query("delete from list where id = $1", [id]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
