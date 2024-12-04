import express from "express";
import knex from "../database_client.js";

const reservationRouter = express.Router();

//Returns all reservations
reservationRouter.get("/", async (req, res, next) => {
  try {
    const reservation = await knex("Reservation");
    res.json(reservation);
  } catch (error) {
    next(error);
  }
});

//Adds a new reservation to the database
reservationRouter.post("/", async (req, res, next) => {
  try {
    const { meal_id, number_of_guests } = req.body;

    // Fetch the meal's available spots
    const meal = await knex("meal")
      .leftJoin("reservation", "meal.id", "=", "reservation.meal_id")
      .select(
        "meal.max_reservations",
        knex.raw(
          "meal.max_reservations - COALESCE(SUM(reservation.number_of_guests), 0) as available_spots"
        )
      )
      .where("meal.id", meal_id)
      .groupBy("meal.id")
      .first();

    if (!meal || number_of_guests > meal.available_spots) {
      return res.status(400).json({ error: "Not enough available spots" });
    }

    // Insert the reservation
    await knex("reservation").insert(req.body);
    res.status(201).json({ message: "Reservation created successfully" });
  } catch (error) {
    next(error);
  }
});


//GET reservations by id
reservationRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const reservation = await knex("Reservation").where("id", id).first();
    if (!reservation) {
      res.json({ message: "Reservation not found" });
    } else {
      res.json(reservation);
    }
  } catch (error) {
    next(error);
  }
});

//Updates the Reservation by id
reservationRouter.put("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const updatedReservation = req.body;
    const result = await knex("Reservation").where("id", id).update(updatedReservation);
    if (result) {
      res.status(200).json({ message: "Reservation updated successfully" });
    } else {
      res.status(404).json({ message: "Reservation not found" });
    }
  } catch (error) {
    next(error);
  }
});

//Deletes the Reservation by id
reservationRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const deletedReservation = await knex("Reservation").where("id", id).del();
    if (deletedReservation) {
      res.status(200).json({ message: "deleted successfully" });
    } else {
      res.status(404).json({ message: "Reservation not found" });
    }
  } catch (error) {
    next(error);
  }
});

export default reservationRouter;
