import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import MovieCard from "./components/MovieCard";
import "./App.css";

function App() {
  const [page, setPage] = useState("movies");

  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);

  const [name, setName] = useState("");
  const [tickets, setTickets] = useState(1);

  const [loading, setLoading] = useState(true);

  // Load data when the application starts
  useEffect(() => {
    loadMovies();
    loadShows();
    loadBookings();
  }, []);

  // Get movies from Supabase
  const loadMovies = async () => {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order("id");

    if (error) {
      console.error("Movie error:", error);
    } else {
      setMovies(data || []);
    }

    setLoading(false);
  };

  // Get shows from Supabase
  const loadShows = async () => {
    const { data, error } = await supabase
      .from("shows")
      .select(`
        id,
        movie_id,
        theatre,
        show_date,
        show_time,
        price,
        movies (
          title
        )
      `)
      .order("show_date");

    if (error) {
      console.error("Show error:", error);
    } else {
      setShows(data || []);
    }
  };

  // Get bookings from Supabase
  const loadBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        customer_name,
        tickets,
        created_at,
        shows (
          theatre,
          show_date,
          show_time,
          price,
          movies (
            title
          )
        )
      `)
      .order("created_at", {
        ascending: false
      });

    if (error) {
      console.error("Booking error:", error);
    } else {
      setBookings(data || []);
    }
  };

  // Select a movie
  const selectMovie = (movie) => {
    setSelectedMovie(movie);
    setSelectedShow(null);
    setPage("book");
  };

  // Select a show
  const selectShow = (show) => {
    setSelectedShow(show);
    setPage("payment");
  };

  // Confirm and save booking
  const confirmBooking = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!selectedShow) {
      alert("Please select a show.");
      return;
    }

    if (Number(tickets) < 1) {
      alert("Please select at least 1 ticket.");
      return;
    }

    const { error } = await supabase
      .from("bookings")
      .insert([
        {
          show_id: selectedShow.id,
          customer_name: name.trim(),
          tickets: Number(tickets)
        }
      ]);

    if (error) {
      console.error("Booking error:", error);
      alert("Booking failed. Please try again.");
      return;
    }

    await loadBookings();

    setName("");
    setTickets(1);

    alert("🎉 Booking confirmed successfully!");

    setPage("bookings");
  };

  // Calculate payment
  const ticketAmount = selectedShow
    ? Number(selectedShow.price) * Number(tickets)
    : 0;

  const convenienceFee = selectedShow
    ? 30
    : 0;

  const totalAmount =
    ticketAmount + convenienceFee;

  // Loading screen
  if (loading) {
    return (
      <div className="loading">
        <h2>Loading Cinema Booking...</h2>
      </div>
    );
  }

  return (
    <div className="app">

      {/* Navigation Bar */}
      <nav className="navbar">

        <div
          className="logo"
          onClick={() => setPage("movies")}
        >
          🎬 Cinema Booking
        </div>

        <div className="nav-links">

          <button
            onClick={() => setPage("movies")}
          >
            Movies
          </button>

          <button
            onClick={() => setPage("book")}
          >
            Book Ticket
          </button>

          <button
            onClick={() => setPage("payment")}
          >
            Payment
          </button>

          <button
            onClick={() => {
              loadBookings();
              setPage("bookings");
            }}
          >
            My Bookings
          </button>

        </div>

      </nav>

      {/* ================= MOVIES PAGE ================= */}

      {page === "movies" && (

        <main>

          <section className="hero">

            <h1>
              🎬 Welcome to Cinema Booking
            </h1>

            <p>
              Book your favourite movies easily.
            </p>

            <button
              onClick={() => setPage("book")}
            >
              Start Booking
            </button>

          </section>

          <h2>Now Showing</h2>

          {movies.length === 0 ? (

            <div className="empty">
              <p>No movies available.</p>
            </div>

          ) : (

            <div className="movie-list">

              {movies.map((movie) => (

                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onSelect={selectMovie}
                />

              ))}

            </div>

          )}

        </main>

      )}

      {/* ================= BOOKING PAGE ================= */}

      {page === "book" && (

        <main>

          <h1>🎟️ Book Your Ticket</h1>

          {!selectedMovie ? (

            <>

              <p>
                Select a movie to continue:
              </p>

              <div className="movie-list">

                {movies.map((movie) => (

                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelect={selectMovie}
                  />

                ))}

              </div>

            </>

          ) : (

            <>

              <div className="selected-movie">

                <h2>
                  {selectedMovie.title}
                </h2>

                <p>
                  {selectedMovie.genre} •{" "}
                  {selectedMovie.language}
                </p>

                <button
                  className="small-button"
                  onClick={() => {
                    setSelectedMovie(null);
                    setSelectedShow(null);
                  }}
                >
                  Change Movie
                </button>

              </div>

              <h2>Available Shows</h2>

              {shows.filter(
                (show) =>
                  show.movie_id === selectedMovie.id
              ).length === 0 ? (

                <p>
                  No shows available for this movie.
                </p>

              ) : (

                <div className="show-list">

                  {shows
                    .filter(
                      (show) =>
                        show.movie_id ===
                        selectedMovie.id
                    )
                    .map((show) => (

                      <div
                        className="show-card"
                        key={show.id}
                      >

                        <h3>
                          🎦 {show.theatre}
                        </h3>

                        <p>
                          📅 {show.show_date}
                        </p>

                        <p>
                          🕐 {show.show_time}
                        </p>

                        <p>
                          💰 ₹{show.price}
                        </p>

                        <button
                          onClick={() =>
                            selectShow(show)
                          }
                        >
                          Select Show
                        </button>

                      </div>

                    ))}

                </div>

              )}

            </>

          )}

        </main>

      )}

      {/* ================= PAYMENT PAGE ================= */}

      {page === "payment" && (

        <main>

          <div className="payment">

            <h1>💳 Payment Details</h1>

            {!selectedShow ? (

              <div className="empty">

                <p>
                  Please select a movie and show first.
                </p>

                <button
                  onClick={() => setPage("book")}
                >
                  Go to Booking
                </button>

              </div>

            ) : (

              <>

                {/* Movie Information */}

                <div className="payment-section">

                  <h2>
                    {selectedShow.movies?.title}
                  </h2>

                  <p>
                    🎦 <strong>Theatre:</strong>{" "}
                    {selectedShow.theatre}
                  </p>

                  <p>
                    📅 <strong>Date:</strong>{" "}
                    {selectedShow.show_date}
                  </p>

                  <p>
                    🕐 <strong>Time:</strong>{" "}
                    {selectedShow.show_time}
                  </p>

                </div>

                <hr />

                {/* Customer Information */}

                <div className="customer-details">

                  <h3>Customer Details</h3>

                  <label>
                    Your Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                  />

                  <label>
                    Number of Tickets
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tickets}
                    onChange={(e) =>
                      setTickets(e.target.value)
                    }
                  />

                </div>

                <hr />

                {/* Price Details */}

                <div className="price-details">

                  <h3>Price Details</h3>

                  <p>
                    Ticket Price
                    <span>
                      ₹{selectedShow.price}
                    </span>
                  </p>

                  <p>
                    Number of Tickets
                    <span>
                      {tickets}
                    </span>
                  </p>

                  <p>
                    Ticket Amount
                    <span>
                      ₹{ticketAmount}
                    </span>
                  </p>

                  <p>
                    Convenience Fee
                    <span>
                      ₹{convenienceFee}
                    </span>
                  </p>

                  <hr />

                  <h2>
                    Total Amount
                    <span>
                      ₹{totalAmount}
                    </span>
                  </h2>

                </div>

                <button
                  className="confirm-button"
                  onClick={confirmBooking}
                >
                  Confirm Booking
                </button>

                <p className="demo-text">
                  This is a demo payment page.
                  No real payment will be charged.
                </p>

              </>

            )}

          </div>

        </main>

      )}

      {/* ================= MY BOOKINGS ================= */}

      {page === "bookings" && (

        <main>

          <h1>📋 My Bookings</h1>

          {bookings.length === 0 ? (

            <div className="empty">

              <p>
                You don't have any bookings yet.
              </p>

              <button
                onClick={() => setPage("movies")}
              >
                Browse Movies
              </button>

            </div>

          ) : (

            <div className="booking-list">

              {bookings.map((booking) => (

                <div
                  className="booking-card"
                  key={booking.id}
                >

                  <div className="booking-header">

                    <h2>
                      {booking.shows?.movies?.title}
                    </h2>

                    <span className="confirmed">
                      Confirmed
                    </span>

                  </div>

                  <p>
                    👤 <strong>Name:</strong>{" "}
                    {booking.customer_name}
                  </p>

                  <p>
                    🎦 <strong>Theatre:</strong>{" "}
                    {booking.shows?.theatre}
                  </p>

                  <p>
                    📅 <strong>Date:</strong>{" "}
                    {booking.shows?.show_date}
                  </p>

                  <p>
                    🕐 <strong>Time:</strong>{" "}
                    {booking.shows?.show_time}
                  </p>

                  <p>
                    🎟️ <strong>Tickets:</strong>{" "}
                    {booking.tickets}
                  </p>

                  <p>
                    💰 <strong>Amount:</strong>{" "}
                    ₹
                    {Number(
                      booking.shows?.price || 0
                    ) *
                      Number(booking.tickets) +
                      30}
                  </p>

                </div>

              ))}

            </div>

          )}

        </main>

      )}

    </div>
  );
}

export default App;
