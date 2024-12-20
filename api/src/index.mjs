import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import knex from "./database_client.js";
import allMealsRouter from "./routers/all-meals.js";
import pastMealsRouter from "./routers/past-meals.js";
import futureMealsRouter from "./routers/future-meals.js";
import firstMealRouter from "./routers/first-meal.js";
import lastMealRouter from "./routers/last-meal.js";
import mealsRouter from "./routers/meals.js";
import reservationsRouter from "./routers/reservations.js";
import reviewRouter from "./routers/reviews.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const apiRouter = express.Router();

apiRouter.get("/", async (req, res) => {
  res.send("<h1>Welcome to the Meal Sharing app </h1>");
});

mealsRouter.get("/", async (req, res) => {
    const meals = await knex("meal").orderBy("id");
    res.json(meals);
})

app.use("/api", apiRouter);
app.use("/all-meals", allMealsRouter);
app.use("/past-meals", pastMealsRouter);
app.use("/future-meals", futureMealsRouter);
app.use("/first-meal", firstMealRouter);
app.use("/last-meal", lastMealRouter);
app.use("/reviews", reviewRouter);
app.use("/meals", mealsRouter);
app.use("/reservations", reservationsRouter);

app.listen(process.env.PORT, () => {
  console.log(`API listening on port ${process.env.PORT}`);
});
