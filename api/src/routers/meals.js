import express from "express";
import knex from "../database_client.js";

const mealsRouter = express.Router();

// Return all meals
mealsRouter.get("/", async (req, res, next) => {
  try {
    const {
      maxPrice,
      availableReservations,
      title,
      dateAfter,
      dateBefore,
      sortKey,
      sortDir,
    } = req.query;

    // Query meals with reservations info
    const query = knex("meal")
      .leftJoin("reservation", "meal.id", "=", "reservation.meal_id")
      .select(
        "meal.*",
        knex.raw(
          "COALESCE(SUM(reservation.number_of_guests), 0) as reserved_spots"
        ),
        knex.raw(
          "meal.max_reservations - COALESCE(SUM(reservation.number_of_guests), 0) as available_spots"
        )
      )
      .groupBy("meal.id");

    // Apply filters
    if (!isNaN(maxPrice)) query.where("meal.price", "<", maxPrice);
    if (title) query.where("meal.title", "like", `%${title}%`);
    if (dateAfter) query.where("meal.when", ">", dateAfter);
    if (dateBefore) query.where("meal.when", "<", dateBefore);
    if (availableReservations === "true") {
      query.having("available_spots", ">", 0);
    } else if (availableReservations === "false") {
      query.having("available_spots", "<=", 0);
    }

    // Sorting
    if (sortKey) {
      const validSortKeys = ["price", "title", "max_reservations"];
      if (sortKey === "stars") {
        query
          .leftJoin("review", "meal.id", "=", "review.meal_id")
          .select(knex.raw("AVG(review.stars) as avg_stars"))
          .orderBy("avg_stars", sortDir === "desc" ? "desc" : "asc");
      } else if (validSortKeys.includes(sortKey)) {
        query.orderBy(sortKey, sortDir === "desc" ? "desc" : "asc");
      } else {
        return res.status(400).json({ error: `Invalid sortKey: ${sortKey}` });
      }
    }

    // Execute query
    const meals = await query;
    res.json(meals);
  } catch (error) {
    next(error);
  }
});

// Insert a new meal
mealsRouter.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    await knex("meal").insert(data);
    res.status(200).json({ message: "Meal created successfully" });
  } catch (error) {
    next(error);
  }
});

// Get a meal by ID with reserved and available spots
mealsRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const meal = await knex("meal")
      .leftJoin("reservation", "meal.id", "=", "reservation.meal_id")
      .select(
        "meal.*",
        knex.raw(
          "COALESCE(SUM(reservation.number_of_guests), 0) as reserved_spots"
        ),
        knex.raw(
          "GREATEST(meal.max_reservations - COALESCE(SUM(reservation.number_of_guests), 0), 0) as available_spots"
        ) // Clamp available spots to zero if negative
      )
      .where("meal.id", id)
      .groupBy("meal.id")
      .first();

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    res.json(meal);
  } catch (error) {
    next(error);
  }
});


// Get reviews for a specific meal
mealsRouter.get("/:meal_id/reviews", async (req, res, next) => {
  try {
    const { meal_id } = req.params;
    const reviewsForMeal = await knex("review").where("meal_id", meal_id);
    if (reviewsForMeal.length === 0) {
      res.status(404).json({ message: "No reviews found for this meal" });
    } else {
      res.json(reviewsForMeal);
    }
  } catch (error) {
    next(error);
  }
});

// Update a meal by ID
mealsRouter.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedMeal = req.body;
    const updated = await knex("meal").where({ id }).update(updatedMeal);

    if (updated) {
      res.status(200).json({ message: "Meal updated successfully" });
    } else {
      res.status(404).json({ message: "Meal not found" });
    }
  } catch (error) {
    next(error);
  }
});

// Delete a meal by ID
mealsRouter.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await knex("meal").where({ id }).del();

    if (deleted) {
      res.status(200).json({ message: "Meal deleted successfully" });
    } else {
      res.status(404).json({ message: "Meal not found" });
    }
  } catch (error) {
    next(error);
  }
});

export default mealsRouter;
