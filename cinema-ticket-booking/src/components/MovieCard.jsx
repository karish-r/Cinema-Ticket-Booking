function MovieCard({ movie, onSelect }) {
  return (
    <div className="movie-card">

      <div className="movie-icon">
        🎬
      </div>

      <h2>{movie.title}</h2>

      <p>
        {movie.genre} • {movie.language}
      </p>

      <button onClick={() => onSelect(movie)}>
        Book Now
      </button>

    </div>
  );
}

export default MovieCard;
