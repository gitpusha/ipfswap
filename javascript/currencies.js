// ##############Variable Declaration#####################

// IF

// ###Fetching and displaying available ERC20s###

// Ropsten Network

// By default, set network to mainet
let selectedEthereumNetwork = "mainnet"

let url;

// By default, address to sell will be ETH (Same for ropsten and mainnet)
let addressToSell = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

let addressToBuy;

// If selected Network is Mainnet
if (selectedEthereumNetwork == "mainnet") {

  url = "https://api.kyber.network/currencies";
  // Kyber Network ERC20 mainnet address
  addressToBuy = "0xdd974d5c2e2928dea5f71b9825b8b646686bd200";
} else if (selectedEthereumNetwork = "ropsten" ) {

  url = "https://ropsten-api.kyber.network/currencies";
  // Kyber Network ERC20 ropstem address
  addressToBuy = "0x4e470dc7321e84ca96fcaedd0c8abcebbaeb68c6";
};

const sellForm = document.getElementById("sellDropdown");
const buyForm = document.getElementById("buyDropdown");

// Array to input individual token data from KyberAPI call
const currencyArray = [];
let item;

// Mainet ERC20 addresses to fetch the images even if user selects ropsten
const mainnetAddresses = {};

// Assign currently selected src and dest token symbols

let srcSymbol = "ETH";
let destSymbol = "KNC";

// Set default source Token Decimal number to 10^18
let srcQuantity = "1000000000000000000";

// Select the two token logos

const sellLogo = document.getElementById('sell-logo');
const buyLogo = document.getElementById('buy-logo');

// Function to change the image to default no image available image if Trust Wallet Api returns 404

function noImageSell() {
  sellLogo.src = "images/no-image.png"
}

function noImageBuy() {
  buyLogo.src = "images/no-image.png"
}

// Event listener to change image to no-image.png is nothing is fetched

sellLogo.addEventListener("error", noImageSell)
buyLogo.addEventListener("error", noImageBuy)


// ######################Functions#############################

// To display the Tokens in an alphabetical order, the fetchCurrencies function needs to only fetch the available names of the tokens wheras a seperate function createCurrencyList will create the necessary HTML Tags

// Create HTML tags to display currencies to user through the list

function createHtmlTags() {
  currencyArray.forEach((currencyArray) => {
    // Input Currencies to buy
    let currencyTag = `<a href="#"name="${currencyArray[0]}" data-decimal="${currencyArray[3]}" id="${currencyArray[1]}" value="${currencyArray[2]}">${currencyArray[0]} - (${currencyArray[1]})</a>`
    buyForm.insertAdjacentHTML("beforeend", currencyTag);
    sellForm.insertAdjacentHTML("beforeend", currencyTag);
  })
}

// Fetch currencies from KyberAPI and store sorted in currencyArray Array. Then call createHtmlTags function
function fetchCurrencies() {
  fetch(url)
    .then(response => response.json())
    .then((data) => {
      data.data.forEach((currency) => {
        item = [currency.name, currency.symbol, currency.address, currency.decimals]
        currencyArray.push(item);
        mainnetAddresses[currency.symbol] = currency.address
      });
    })
    .then((result) => {
      currencyArray.sort();
      createHtmlTags();
  });
}

fetchCurrencies();




/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */

function SellFunction() {
  document.getElementById("sellDropdown").classList.toggle("show");
}

function BuyFunction() {
  document.getElementById("buyDropdown").classList.toggle("show");
}


// Close the dropdown menu if User selects a token from dropdown
window.onclick = function(event) {
  // If User clicks on Search bar, do not close the window
  if (event.target.id == "sellSearch" || event.target.id == "buySearch") return 0;
  // Check condition if User pressed anything else than the image or the title of the token
  if (event.target.parentElement.id != "sell-content" && event.target.parentElement.id != "buy-content"){
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');

        // If the sell Dropdown is selected
        if (openDropdown.id == "sellDropdown") {

          // Set src Token Symbol
          srcSymbol = event.target.attributes.id.value;

          // Find token address of selected token from mainnetAddresses hash
          let sellTokenImageUrl = mainnetAddresses[srcSymbol];

          // Set token-logo for token to sell. If it is ETH, then use local image
          (srcSymbol == "ETH") ? sellLogo.src = "images/ethereum.png" : sellLogo.src = `https://raw.githubusercontent.com/TrustWallet/tokens/master/images/${sellTokenImageUrl}.png`;

          // Set new token address for getExpectedRate function
          addressToSell = `${event.target.attributes[4].value}`;

          // Get Source token decimal for GetExpectedRate function
          srcDecimal = event.target.dataset.decimal;

          // Calc srcQuantity with srcDecimal
          srcQuantity = `${10 ** srcDecimal}`;

          // Re-run getExpectedRate function for new address pair
          getExpectedRate()

          // Refresh Expected rate
          // displayExchangeRate();


          // Set Dropdown value to Token name & symbol
          document.getElementById("sell-button").innerText = `${event.target.attributes.name.value} - (${event.target.attributes.id.value})`;

          // Set sell-symbol Symbol to srcSybol
          document.getElementById('sell-symbol').innerText = srcSymbol


          return addressToSell;
          // If the buy Dropdown is selected
        } else if (openDropdown.id == "buyDropdown") {

          // Set src Token Symbol
          destSymbol = event.target.attributes.id.value;

          // Find token address of selected token from mainnetAddresses hash
          let buyTokenImageUrl = mainnetAddresses[destSymbol];

          // Set token-logo for token to buy. If it is ETH, then use local image
          (destSymbol == "ETH") ? buyLogo.src = "images/ethereum.png" : buyLogo.src = `https://raw.githubusercontent.com/TrustWallet/tokens/master/images/${buyTokenImageUrl}.png`;

          // Set token address which the user wants to buy
          addressToBuy = `${event.target.attributes[4].value}`;


          // Re-run getExpectedRate function for new address pair
          getExpectedRate()


          // Set Dropdown value to Token acronym
          document.getElementById("buy-button").innerText = `${event.target.attributes.name.value} - (${event.target.attributes.id.value})`;

          // Set buy-symbol to srcSybol
          document.getElementById('buy-symbol').innerText = destSymbol


          return addressToBuy;
        } else {
          console.log("not working")
        }
      }
    }
  }
}

sellSearch = document.querySelector('#sellSearch');
sellSearch.addEventListener('keyup', filterFunction)

buySearch = document.querySelector('#buySearch');
buySearch.addEventListener('keyup', filterFunction)

// Filter Functionality to search for specific currencies with input
function filterFunction(event) {
  let input, filter, a, i;
  if (event.target.id == "sellSearch") {
    input = sellSearch
    div = document.getElementById("sellDropdown");
  } else if (event.target.id == "buySearch") {
    input = buySearch;
    div = document.getElementById("buyDropdown");
    // Input stuff
  }
  filter = input.value.toUpperCase();
  a = div.querySelectorAll("a");

  // Check if the inputted letter is somewhere in the selected currency name before the last index. changing the a[i].style.display to "" makes it visible, setting it to none makes it invisible from a css perspective
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].name;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}


// LEGACY CODE

// function fetchCurrencies() {
//   fetch(url)
//     .then(response => response.json())
//     .then((data) => {
//       data.data.forEach((currency) => {
//         // Input Currencies to buy
//                   //<a href="#">EOS</a>
//         let buyItem =  `<a href="#"name="${currency.name}" id="${currency.symbol}" value="${currency.address}">${currency.name} - (${currency.symbol})</a>`
//         // let buyItem = `<input type="radio" name="buyItem" id="buy-${currency.symbol}" value="${currency.symbol}">${currency.name} - ${currency.symbol}<br>`;
//         buyForm.insertAdjacentHTML("beforeend", buyItem);

//         // Input Currencies to sell
//         let sellItem =  `<a href="#" name="${currency.name}" id="${currency.symbol}" value="${currency.address}">${currency.name} - (${currency.symbol})</a>`
//         // let sellItem = `<input type="radio" name="sellItem" id="sell-${currency.symbol}" value="${currency.symbol}">${currency.name} - ${currency.symbol}<br>`;
//         sellForm.insertAdjacentHTML("beforeend", sellItem);
//       });
//   });
// }
