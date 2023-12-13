'use strict';
import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs'
const cartButton = document.querySelector("#cart-button"),
    modal = document.querySelector(".modal"),
    close = document.querySelector(".close"),
    buttonAuth = document.querySelector(".button-auth"),
    modalAuth = document.querySelector(".modal-auth"),
    closeAuth = document.querySelector(".close-auth"),
    logInForm = document.querySelector("#logInForm"),
    loginInput = document.querySelector("#login"),
    userName = document.querySelector(".user-name"),
    buttonOut = document.querySelector(".button-out"),
    cardsRestaurants = document.querySelector(".cards-restaurants"),
    containerPromo = document.querySelector(".container-promo"),
    restaurants = document.querySelector(".restaurants"),
    menu = document.querySelector(".menu"),
    logo = document.querySelector(".logo"),
    cardsMenu = document.querySelector(".cards-menu"),
    restaurantTitle = document.querySelector(".restaurant-title"),
    rating = document.querySelector(".rating"),
    minPrice = document.querySelector(".price"),
    category = document.querySelector(".category"),
    inputSearch = document.querySelector(".input-search")

let login = localStorage.getItem("logName");


const getData = async function (url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Ошибка по адресу ${url},
			статус ошибки ${response,status}`);
    }
    return await response.json();

}

const validName = function (str) {
    const nameReg = /^[a-zA-Z][a-zA-z0-9-_\.]{1,20}$/;
    return nameReg.test(str);
};

function toggleModal() {
    modal.classList.toggle("is-open");
}

function toggleModalAuth() {
    loginInput.style.borderColor = "";
    modalAuth.classList.toggle('is-open');
}

function returnMain() {
    containerPromo.classList.remove("hide");
    restaurants.classList.remove("hide");
    menu.classList.add("hide");
}

function returnRestaurants() {
    cardsMenu.textContent = "";
    containerPromo.classList.add("hide");
    restaurants.classList.add("hide");
    menu.classList.remove("hide");
}

function authorized() {

    function logOut() {
        login = null;
        localStorage.removeItem("logName");

        buttonAuth.style.display = "";
        userName.style.display = "";
        buttonOut.style.display = "";
        buttonOut.removeEventListener("click", logOut);
        checkAuth();
        returnMain();
    }

    console.log("Авторизован");

    userName.textContent = login;

    buttonAuth.style.display = "none";
    userName.style.display = "inline";
    buttonOut.style.display = "flex";
    cartButton.style.display = "flex";

    buttonOut.addEventListener("click", logOut);

}

function notAuthorized() {
    console.log("не авторизован");

    function logIn(event) {
        event.preventDefault();
        login = (loginInput.value).trim();

        if (!validName(login)) {
            event.preventDefault();
            loginInput.style.borderColor = "red";
        } else {

            localStorage.setItem("logName", login);

            toggleModalAuth();
            buttonAuth.removeEventListener("click", toggleModalAuth);
            closeAuth.removeEventListener("click", toggleModalAuth);
            logInForm.removeEventListener("submit", logIn);
            checkAuth();
        }

    }

    buttonAuth.addEventListener("click", toggleModalAuth);
    closeAuth.addEventListener("click", toggleModalAuth);
    logInForm.addEventListener("submit", logIn);
}

function checkAuth() {
    if (login) {
        authorized();
    } else {
        notAuthorized();
    }
}

function createCardRestaurant({ image, kitchen, name, price, stars,
    products, time_of_delivery: timeOfDelivery }) {

    const card = document.createElement("a");
    card.className = "card card-restaurant";
    card.products = products;
    card.info = [name, price, stars, kitchen];

    card.insertAdjacentHTML("beforeend", `
		<img src="${image}" alt="${name}" class="card-image"/>
		<div class="card-text">
			<div class="card-heading">
				<h3 class="card-title">${name}</h3>
				<span class="card-tag tag">${timeOfDelivery} мин</span>
			</div>
			<div class="card-info">
				<div class="rating">
					${stars}
				</div>
				<div class="price">От ${price} ₽</div>
				<div class="category">${kitchen}</div>
			</div>
		</div>
	`);
    cardsRestaurants.insertAdjacentElement("beforeend", card);
}

function createCardGood({ description, image, name, price, id }) {
    const card = document.createElement("div");
    card.className = "card";

    card.insertAdjacentHTML("beforeend", `
		<img src="${image}" alt="${name}" class="card-image"/>
		<div class="card-text">
			<div class="card-heading">
				<h3 class="card-title card-title-reg">${name}</h3>
			</div>
			<div class="card-info">
				<div class="ingredients">${description}
				</div>
			</div>
			<div class="card-buttons">
				<button class="button button-primary button-add-cart" id="${id}">
					<span class="button-card-text">В корзину</span>
					<span class="button-cart-svg"></span>
				</button>
				<strong class="card-price card-price-bold">${price} ₽</strong>
			</div>
		</div>
	`);

    cardsMenu.insertAdjacentElement("beforeend", card);
}

function openGoods(event) {
    const target = event.target;

    if (login) {

        const restaurant = target.closest(".card-restaurant");

        if (restaurant) {

            const [name, price, stars] = restaurant.info;

            returnRestaurants();

            restaurantTitle.textContent = name;
            rating.textContent = stars;
            minPrice.textContent = `От ${price} Р`;
            category.textContent = "";

            getData(`./db/${restaurant.products}`).then(function (data) {
                data.forEach(createCardGood);
            });
        }

    } else {
        toggleModalAuth();
    }

}







function init() {
    getData("./db/partners.json").then(function (data) {
        data.forEach(createCardRestaurant);
    });

    cardsRestaurants.addEventListener("click", openGoods);

    logo.addEventListener("click", returnMain);


    cartButton.addEventListener("click", function () {
        toggleModal();
    });


    close.addEventListener("click", toggleModal);

    inputSearch.addEventListener("keydown", searchAllGoods);

    checkAuth();

    new Swiper('.swiper-container', {
        sliderPerView: 1,
        loop: true,
        autoplay: true,
        effect: 'cube',
        grabCursor: true,
        cubeEffect: {
            shadow: false,
        },
    });
}
function searchAllGoods (event) {
	if(event.keyCode == 13) {
		const target = event.target;

		const value = target.value.toLowerCase().trim();

		if(!value || value.length < 3) {
			target.style.backgroundColor = "red";
			setTimeout(function() {
				target.style.backgroundColor = "";
			}, 2000);
			return;
		}

		target.value = "";

		const goods = [];

		getData("./db/partners.json")
			.then(function(data) {
				const products = data.map(function(item) {
					return item.products;
				});

				products.forEach(function(product) {
					getData(`./db/${product}`)
						.then(function(data) {
							goods.push(...data);

							const searchGoods = goods.filter(function(item) {
								return item.name.toLowerCase().includes(value);
							});

							returnRestaurants();

							restaurantTitle.textContent = "Результат поиска";
							rating.textContent = "";
							minPrice.textContent = "";
							category.textContent = "";

							return searchGoods;

						})
						.then(function(data) {
							data.forEach(createCardGood);
						});
				});
			});

	}
}
init();
