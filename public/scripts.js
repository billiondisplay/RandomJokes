const jokeContainer = document.getElementById("joke");
const btn = document.getElementById("btn");
const url = "/api/joke"; // Points to local API

let getJoke = () => {
  jokeContainer.classList.remove("fade"); // Ensure the previous joke fades out
  jokeContainer.textContent = ""; // Clear the current text for a smoother transition

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((item) => {
      // Wait for a moment before displaying the new joke for better transition effect
      setTimeout(() => {
        if (item.type === "twopart") {
          jokeContainer.textContent = `${item.setup} ... ${item.delivery}`;
        } else {
          jokeContainer.textContent = item.joke;
        }
        jokeContainer.classList.add("fade"); // Apply fade-in effect
      }, 300); // Delay for the fade-out effect to complete
    })
    .catch((error) => {
      jokeContainer.textContent =
        "Oops! Unable to fetch a joke. Please try again later.";
      console.error("Error fetching the joke:", error);
    });
};

btn.addEventListener("click", getJoke);
getJoke(); // Fetch a joke on page load
