const FAVORITES_KEY = "favorites";
const favDiv = document.getElementById("favorites");
const clearBtn = document.getElementById("clearFavorites");

function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
}

//alert when saving a movie to favorites
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 2500);
}

function render() {
  const favs = getFavorites();
  favDiv.innerHTML = ""; // Clear previous content

  if (favs.length === 0) {
    favDiv.innerHTML =
      "<p style='font-size: 20px;  font-family: Arial, sans-serif; color: black; text-align: center;'>There are no favorite movies added yet.</p>";
    return;
  }

  favs.forEach((movie) => {
    const title =
      movie.primaryTitle || movie.originalTitle || movie.title || movie.name;

    if (!title) {
      console.warn("Favorite item missing title fields:", movie);
      return; // skip broken entry
    }

    const imageUrl =
      movie.primaryImage ||
      movie.image ||
      movie.thumbnails?.[0]?.url ||
      "https://via.placeholder.com/150x220?text=No+Image";

    const description = movie.description || "";
    const type = movie.type || "";
    const genres = Array.isArray(movie.genres)
      ? movie.genres.join(", ")
      : movie.genres || "";
    const id = movie.id || "";

    favDiv.innerHTML += `
    <div class="movie">
      <img src="${imageUrl}" alt="${title}">
      <div>
        <h3>${title}</h3>
        ${type ? `<p>Type: ${type}</p>` : ""}
        ${genres ? `<p>Genre: ${genres}</p>` : ""}
        ${description ? `<p>${description}</p>` : ""}
      </div>
    </div>
  `;
  });
}

render();

clearBtn.addEventListener("click", () => {
  localStorage.removeItem(FAVORITES_KEY);
  render();
  showToast("All movies cleared from favorites!");
});
