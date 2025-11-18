const API_KEY = "0788fb9121mshf0a1c29bbc2833ep1a0193jsn711768190bd3";
const searchBtn = document.getElementById("searchBtn");
const moviesDiv = document.getElementById("movies");
const clearBtn = document.getElementById("clear");

//Here we are running the function, when user clicks search for movie btn//
//async => allow us to await data to be fetched
searchBtn.addEventListener("click", async () => {
  //Gets the information from the user based on his input
  const movieInput = document.getElementById("movieInput").value.trim();

  //If movie is not entered this msg is shown
  if (!movieInput) {
    alert("Please enter a movie name!");
    return;
  }

  //fetch sends the request to the API
  const res = await fetch(
    //contains the search term
    `https://movie-database-api1.p.rapidapi.com/list_movies.json?limit=20&page=1&query_term=${movieInput}`, 
    {
      //headers required by API Service to authenticate the request...
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "movie-database-api1.p.rapidapi.com",
      },
    }
  );

  //Some checks 

  const dispMovies = await res.json(); // converting the api response into js object
  console.log(dispMovies);
  moviesDiv.innerHTML = ""; //Clearing old movies results every time.

  if (dispMovies.data && dispMovies.data.movies) {
    //If movie exist they are displayed
    dispMovies.data.movies.forEach((movie) => {
      const movieCard = `
            <div class="movie">
              <img src="${movie.medium_cover_image}" alt="${
        movie.title
      }">
              <div>
                <h3>${movie.title} (${movie.year})</h3>
                <p>Rating: ${movie.rating}</p>
                <p>Genres: ${movie.genres ? movie.genres.join(", ") : "N/A"}</p>
                <p>Runtime ${movie.runtime}</p>
                <button class="fav-btn" data-id="${movie.id}"> Favorite</button>
              </div>
            </div>
          `;
      moviesDiv.innerHTML += movieCard; //adds each movie to the page
    });
  } else {
    //No movie is displayed
    moviesDiv.innerHTML = `<p> No movies found!</p>`;
  }
});

//Enter button to function on search
movieInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchBtn.click();
  }
});

//Clearing movies
clearBtn.addEventListener("click", function () {
  moviesDiv.innerHTML = ""; //Clearing all movies
  movieInput.value = ""; // Puts nothing in input search
});
