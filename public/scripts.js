const jokeContainer = document.getElementById("joke");
const btn = document.getElementById("btn")
const url = "https://v2.jokeapi.dev/joke/Any";

let getJoke = () => {
    jokeContainer.classList.remove("fade");
    fetch(url)
    .then(data => data.json())
    .then(item => {
        // Check if the joke is two-part or single
        if(item.type === "twopart") {
            jokeContainer.textContent = `${item.setup} ... ${item.delivery}`;
        } else {
            jokeContainer.textContent = `${item.joke}`;
        }
        jokeContainer.classList.add("fade");
    })
    .catch(error => {
        console.error('Error fetching the joke:', error);
        jokeContainer.textContent = 'Oops! Something went wrong.';
    });
}

btn.addEventListener("click",getJoke)
getJoke();

