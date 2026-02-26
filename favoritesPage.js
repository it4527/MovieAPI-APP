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
    favDiv.innerHTML += `
      <div class="movie">
        <img src="${movie.image}" alt="${movie.title}" style="width:150px">
        <h3>${movie.title} (${movie.year})</h3>
        <p>Rating: ${movie.rating}</p>
        <p>Genre: ${movie.genre}</p>
        <p>Rank: ${movie.rank}</p>
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
