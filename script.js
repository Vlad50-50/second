let productsGrid = document.getElementById("products-grid");
let productsArray = [];
let cartProducts = document.getElementById("cart-products");
let cart = [];
if (localStorage.getItem("cart")) {
    cart = JSON.parse(localStorage.getItem("cart"));
    drawCart();
}

let xhr = new XMLHttpRequest();
xhr.open("GET", "https://marketplace-ad2b.restdb.io/rest/products");
xhr.setRequestHeader("content-type", "application/json");
xhr.setRequestHeader("x-apikey", "65848e1a9b604b3b29b1ea90");
xhr.setRequestHeader("cache-control", "no-cache");
xhr.responseType = "json";
xhr.send();

function buyAll(sum) {
    let orderProducts = document.getElementById("order-products");
    orderProducts.innerHTML = null;
    let productCount = {};
    let uniqueProducts = [];
    cart.forEach(p => {
        if (!productCount[p._id]) {
            productCount[p._id] = 1;
            uniqueProducts.push(p);
        } else {
            productCount[p._id]++;
        }
    })

    uniqueProducts.forEach(p => {
        orderProducts.innerHTML += `
        <div class="card col-4">
            <img src="${p.photo_url}" class="card-img-top">
            <div class="card-body">
                <p class="card-text">${p.name} | ${p.price}UAH</p>
                (Quantity: ${productCount[p._id]})
            </div>
        </div>
        `
    });
    document.getElementById("total-price").innerHTML = "Total price: " + sum + "UAH";
}

xhr.onload = () => {
    productsGrid.innerHTML = null;
    let data = xhr.response;
    data.forEach(p => {
        productsArray.push(p);
        let pElement = document.createElement("div");
        pElement.classList.add("product");
        pElement.innerHTML = `
            <h2 class="product-name">${p.name}</h2>
            <img src="${p.photo_url}" class="product-img" alt="${p.name}">
            <p class="product-desc"><b>Description: </b>${p.description}</p>
            <p class="product-price"><b>Price: </b>${p.price}UAH</p>
            <button onclick="addProductToCart('${p._id}')">Buy</button>
        `;
        productsGrid.appendChild(pElement);
    });
}

function openCart() {
    cartProducts.classList.toggle("hide");
}

let cartButton = document.getElementById("cart-button");
function addProductToCart(id) {
    let product = productsArray.find((p) => {
        return p._id == id;
    })
    cart.push(product);
    drawCart();
    localStorage.setItem("cart", JSON.stringify(cart));
    cartButton.classList.add("active");
    setTimeout(() => {
        cartButton.classList.remove("active")
    }, 500);    
}

function drawCart() {
    if (cart.length == 0) return cartProducts.innerHTML = "Cart is empty";
    cartProducts.innerHTML = null;
    let productCount = {};
    let uniqueProducts = [];
    let sum = 0;
    cart.forEach(p => {
        if (!productCount[p._id]) {
            productCount[p._id] = 1;
            uniqueProducts.push(p);
        } else {
            productCount[p._id]++;
        }
        sum += +p.price;
    })

    uniqueProducts.forEach(p => {
        cartProducts.innerHTML += `
            <p>
                <img src="${p.photo_url}">
                ${p.name}<br><br>
                <b>${p.price}UAH</b>
                (Quantity: ${productCount[p._id]})
            </p><hr>
        `
    });
    cartProducts.innerHTML += `
        <p>Total price: ${sum}UAH</p>
        <button onclick="buyAll(${sum})" type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">Buy all</button>
    `
}

document.getElementById("order-form").addEventListener("submit", (event) => {
    event.preventDefault();
    let data = JSON.stringify({
        "name": event.target["name"].value,
        "address": event.target["address"].value,
        "phone": event.target["phone"].value,
        "post_number": event.target["post-number"].value,
        "status": "New",
        "products": localStorage.getItem("cart")
    });
    let xhr1 = new XMLHttpRequest();
    xhr1.open("POST", "https://marketplace-ad2b.restdb.io/rest/order");
    xhr1.setRequestHeader("content-type", "application/json");
    xhr1.setRequestHeader("x-apikey", "65848e1a9b604b3b29b1ea90");
    xhr1.setRequestHeader("cache-control", "no-cache");
    xhr1.responseType = "json";
    xhr1.send(data);
    xhr1.onload = function () {
        localStorage.removeItem("cart");
        cart = [];
        location.reload();
    }
})
