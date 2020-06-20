const cat = document.getElementById("cat");
const countdown = document.getElementById("countdown");


async function newCat() {
  
  try {
  
    const catDataResponse = await fetch("https://api.thecatapi.com/v1/images/search");
    const catData = await catDataResponse.json();
    console.log(catData[0]);

    if (catData[[0]]) {
      cat.innerHTML = `<img class="cat-image" src=${catData[0].url} />`;
    }
    
    
    let seconds = Math.floor(Math.random() * 240) + 60;
    
    countdown.innerHTML = `<span id="seconds-remaining">${seconds}</span> seconds left!`
    const secondsRemaining = document.getElementById("seconds-remaining");
    
    setInterval(() => {
      seconds--;
      secondsRemaining.innerHTML = seconds;
    }, 1000)
    
    
    
  } catch (error) {
    cat.innerHTML = "";
    console.log(error);
  }
  
}


newCat();