const API_KEY = "0788fb9121mshf0a1c29bbc2833ep1a0193jsn711768190bd3";
const searchBtn = document.getElementById("searchBtn");
const moviesDiv = document.getElementById("movies");
const clearBtn = document.getElementById("clear");
const movieInput = document.getElementById("movieInput");
const CACHE_KEY = "moviesCache"; // stores array
const STATE_KEY = "moviesState"; // stores visibleCount/search/scroll

// Save current state to sessionStorage before navigating away
function saveState() {
  // cache movies list (so going back doesn't require refetch)
  if (Array.isArray(allMovies) && allMovies.length) {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(allMovies));
  }

  sessionStorage.setItem(
    STATE_KEY,
    JSON.stringify({
      visibleCount,
      searchTerm: movieInput.value || "",
      scrollY: window.scrollY,
    }),
  );
}

// Try to restore state from sessionStorage, returns true if successful - previous search results will be shown without refetching, and scroll position will be restored
function restoreStateIfAny() {
  const cached = sessionStorage.getItem(CACHE_KEY);
  const stateRaw = sessionStorage.getItem(STATE_KEY);

  if (!cached || !stateRaw) return false;

  try {
    allMovies = JSON.parse(cached);
    const state = JSON.parse(stateRaw);

    movieInput.value = state.searchTerm || "";
    visibleCount = Number(state.visibleCount) || STEP;

    const term = (state.searchTerm || "").trim().toLowerCase();
    const list = term
      ? allMovies.filter((m) =>
          (m.primaryTitle || m.originalTitle || "")
            .toLowerCase()
            .includes(term),
        )
      : allMovies;

    displayMovies(list, { resetCount: false }); // important: keep visibleCount
    requestAnimationFrame(() => window.scrollTo(0, Number(state.scrollY) || 0));
    return true;
  } catch {
    return false;
  }
}
//////////////END of MAIN logic for state management/////////////////

if (window.innerWidth <= 600) {
  document.body.classList.add("no-scroll");
}

// Global variable to store all movies
let allMovies = [];

let filteredMovies = [];
let visibleCount = 15; // how many movies to show
const STEP = 15; // how many to add each time

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
    id,
    primaryTitle: movie.primaryTitle,
    originalTitle: movie.originalTitle,
    primaryImage: movie.primaryImage,
    thumbnails: movie.thumbnails,
    description: movie.description,
    type: movie.type,
    genres: movie.genres,
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
    const res = await fetch(
      "https://imdb236.p.rapidapi.com/api/imdb/top250-movies",
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "imdb236.p.rapidapi.com",
        },
      },
    );

    allMovies = await res.json();
    console.log("Top Movies loaded:", allMovies);
    console.log("API response:", allMovies);
    console.log("Is array?", Array.isArray(allMovies));
  } catch (error) {
    console.error("Error loading IMDb movies:", error);
    console.log(allMovies);
    moviesDiv.innerHTML = `<p>Error loading IMDb Top 100 movies.</p>`;
  }
}

// Display function
function displayMovies(movies) {
  filteredMovies = Array.isArray(movies) ? movies : [];
  visibleCount = STEP; // reset when new search
  moviesDiv.innerHTML = "";
  renderChunk();
}

function renderChunk() {
  document.body.classList.remove("no-scroll");
  const slice = filteredMovies.slice(0, visibleCount);

  moviesDiv.innerHTML = slice
    .map((movie) => {
      const title = movie.primaryTitle || movie.originalTitle || "Untitled";

      const imageUrl =
        movie.primaryImage ||
        movie.thumbnails?.[0]?.url ||
        "https://via.placeholder.com/150x220?text=No+Image";

      const id = movie.id || "";

      return `
      <div class="movie">
        <img src="${imageUrl}" alt="${title}" loading="lazy">
        <div>
          <h3>${title}</h3>
          <p>Type: ${movie.type || "N/A"}</p>
          <p>Genre: ${movie.genres?.join(", ") || "N/A"}</p>
          <button class="fav-btn" data-id="${id}">Favorite</button>
        </div>
      </div>
    `;
    })
    .join("");

  // Add Load More button if more movies exist
  if (visibleCount < filteredMovies.length) {
    moviesDiv.innerHTML += `
      <button id="loadMore" style="width:100%; padding:12px; margin-top:15px;">
        Load More
      </button>
    `;

    document.getElementById("loadMore").onclick = () => {
      visibleCount += STEP;
      renderChunk();
    };

    document.body.classList.remove("no-scroll");
  }
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
    (movie.primaryTitle || movie.originalTitle || "")
      .toLowerCase()
      .includes(searchTerm),
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

  if (window.innerWidth <= 600) {
    document.body.classList.add("no-scroll");
  }
});

window.addEventListener("load", async () => {
  // 1) restore without fetching (fast, avoids 429)
  if (restoreStateIfAny()) return;

  // 2) otherwise load from API and render normally
  await loadMoviesOnce();
  displayMovies(allMovies);
});
