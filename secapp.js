const API_KEY = "0788fb9121mshf0a1c29bbc2833ep1a0193jsn711768190bd3";
const searchBtn = document.getElementById("searchBtn");
const moviesDiv = document.getElementById("movies");
const clearBtn = document.getElementById("clear");
const movieInput = document.getElementById("movieInput");

// Global variable to store all movies
let allMovies = [];

//Favorite movies array to store the user's favorite movies
const FAVORITES_KEY = "favorites";

function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
}

function setFavorites(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

moviesDiv.addEventListener("click", (e) => {
  const btn = e.target.closest(".fav-btn");
  if (!btn) return;
  console.log("FAV CLICKED id=", btn.dataset.id);
  const id = btn.dataset.id;
  const movie = allMovies.find((m) => String(m.id) === String(id));
  if (!movie) return;
  const favs = getFavorites();

  //push only the necessary movie details to favorites, not the entire movie object to local storage
  favs.push({
    id: movie.id,
    title: movie.title,
    year: movie.year,
    image: movie.image,
    rating: movie.rating,
    genre: movie.genre,
    rank: movie.rank,
  });

  setFavorites(favs);

  showToast("Movie added to favorites!");
});

//alert when saving a movie to favorites
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 2500);
}

// Fetch IMDb Top 100 Movies once when page loads
async function loadTopMovies() {
  try {
    const res = await fetch("https://imdb-top-100-movies.p.rapidapi.com/", {
      method: "GET",
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "imdb-top-100-movies.p.rapidapi.com",
      },
    });

    allMovies = await res.json();
    console.log("Top Movies loaded:", allMovies);
  } catch (error) {
    console.error("Error loading IMDb movies:", error);
    moviesDiv.innerHTML = `<p>Error loading IMDb Top 100 movies.</p>`;
  }
}

// Display function
function displayMovies(movies) {
  moviesDiv.innerHTML = "";

  if (!movies || movies.length === 0) {
    moviesDiv.innerHTML = `<p>No movies found!</p>`;
    return;
  }

  movies.forEach((movie) => {
    const movieCard = `
      <div class="movie">
        <img src="${movie.image}" alt="${movie.title}">
        <div>
          <h3>${movie.title} (${movie.year})</h3>
          <p>Rating: ${movie.rating}</p>
          <p>Genre: ${movie.genre}</p>
          <p>Rank: ${movie.rank}</p>
          <button class="fav-btn" data-id="${movie.id}">Favorite</button>
        </div>
      </div>
    `;
    moviesDiv.innerHTML += movieCard;
  });
}

// When user clicks Search button
searchBtn.addEventListener("click", async () => {
  const searchTerm = movieInput.value.trim().toLowerCase();
  // Load data if not already fetched
  if (allMovies.length === 0) {
    await loadTopMovies(); //waiting the movies to be fetched
  }

  // Filter movies by search term
  const filtered = allMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm),
  );

  displayMovies(filtered);
});

// Allow Enter key to trigger search
movieInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchBtn.click();
  }
});

//Clear button functionality
clearBtn.addEventListener("click", function () {
  moviesDiv.innerHTML = "";
  movieInput.value = "";
 
});
