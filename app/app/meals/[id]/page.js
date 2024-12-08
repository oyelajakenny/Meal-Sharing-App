"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Typography, Paper, Container, Box, Button } from "@mui/material";
import ReservationForm from "@/components/ReservationForm";
import ReviewForm from "@/components/ReviewForm";
import CompassCalibrationIcon from "@mui/icons-material/CompassCalibration";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

function MealDetail() {
  const { id } = useParams();
  const [meal, setMeal] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const fetchMealData = () => {
    if (id) {
      fetch(`https://meal-sharing-app-vr0r.onrender.com/meals/${id}`)
        .then((response) => response.json())
        .then((data) => setMeal(data))
        .catch((err) => setError("Error fetching meal details"));

      fetch(`https://meal-sharing-app-vr0r.onrender.com/meals/${id}/reviews`)
        .then((response) => response.json())
        .then((data) => setReviews(data))
        .catch((err) => setError("Error fetching reviews"));
    }
  };

  // Fetch meal data on component mount and when `reservationSuccess` changes
  useEffect(() => {
    fetchMealData();

    // Reset the reservation success flag after re-fetching data
    if (reservationSuccess) {
      setReservationSuccess(false);
    }
  }, [id, reservationSuccess]);

  return (
    <Container>
      {meal ? (
        <>
          <Paper elevation={3} sx={{ padding: 2, marginBottom: 3 }}>
            <img src={meal.image_url} alt={meal.title} width="100%" />

            <Typography variant="h4" component="h2" gutterBottom>
              {meal.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Description:</strong> {meal.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong style={{ fontWeight: "bold", fontSize: "20px" }}>
                <MonetizationOnIcon /> Price:
              </strong>
              <span
                style={{
                  fontWeight: "bold",
                  color: "green",
                  fontSize: "25px",
                  marginBottom: "10px",
                }}
              >
                {meal.price} Kr
              </span>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <CompassCalibrationIcon /> {meal.location.toUpperCase()}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Max Reservations: {meal.max_reservations}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Available Spots: {meal.available_spots}
            </Typography>

            {meal.available_spots > 0 ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpen}
                  sx={{ marginBottom: 2 }}
                >
                  Make A Reservation
                </Button>
                <ReservationForm
                  mealId={id}
                  open={open}
                  handleClose={handleClose}
                  handleSuccess={() => setReservationSuccess(true)}
                  setError={setError}
                />
              </>
            ) : (
              <Typography variant="body1" color="error">
                No available seats.
              </Typography>
            )}
            {reservationSuccess && (
              <Typography variant="body1" color="success.main">
                Reservation successful!
              </Typography>
            )}
            {error && (
              <Typography variant="body1" color="error">
                {error}
              </Typography>
            )}
          </Paper>

          <Paper elevation={3} sx={{ padding: 2, marginBottom: 3 }}>
            <Typography variant="h5" component="h3" gutterBottom>
              Reviews
            </Typography>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Box
                  key={review.id}
                  className="review"
                  sx={{ marginBottom: 2 }}
                >
                  <Typography variant="subtitle1">
                    <strong>{review.title}</strong> rated {review.stars}/5
                  </Typography>
                  <Typography variant="body2">{review.description}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {review.created_date}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body1">
                No reviews yet. Be the first to review this meal!
              </Typography>
            )}
          </Paper>

          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h5" component="h4" gutterBottom>
              Leave a Review
            </Typography>
            <ReviewForm
              mealId={id}
              setReviewSuccess={setReviewSuccess}
              setReviews={setReviews}
              setError={setError}
            />
            {reviewSuccess && (
              <Typography variant="body1" color="success.main">
                Review submitted successfully!
              </Typography>
            )}
            {error && (
              <Typography variant="body1" color="error">
                {error}
              </Typography>
            )}
          </Paper>
        </>
      ) : (
        <Typography variant="body1">Loading...</Typography>
      )}
    </Container>
  );
}

export default MealDetail;
