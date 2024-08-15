const jokeContainer = document.getElementById("joke");
const btn = document.getElementById("btn");
const url = "/api/joke"; // Now points to local API
const spinner = document.getElementById('spinner');

let getJoke = () => {
    jokeContainer.classList.remove("fade");
    spinner.style.display = "block";  // Show spinner

    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(item => {
        spinner.style.display = "none";  // Hide spinner
        if (item.type === "twopart") {
            jokeContainer.textContent = `${item.setup} ... ${item.delivery}`;
        } else {
            jokeContainer.textContent = item.joke;
        }
        jokeContainer.classList.add("fade");
    })
    .catch(error => {
        spinner.style.display = "none";  // Hide spinner on error
        jokeContainer.textContent = 'Oops! Unable to fetch a joke. Please try again later.';
        console.error('Error fetching the joke:', error);
    });
};

btn.addEventListener("click", getJoke);
getJoke();
