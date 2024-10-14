document.addEventListener('DOMContentLoaded', function () {
    loadProductToShelf('shelf-1', 'svgs/bottle.svg', 20, 0, 'bottle');
    loadProductToShelf('shelf-1', 'svgs/milk.svg', 70, 35, 'milk');
    loadProductToShelf('shelf-1', 'svgs/cupcacke.svg', 120, 81, 'cupcake');
    loadProductToShelf('shelf-1', 'svgs/cheese.svg', 170, 91, 'cheese');
    loadProductToShelf('shelf-2', 'svgs/meat.svg', 20, 165, 'meat');
    loadProductToShelf('shelf-2', 'svgs/chicken.svg', 70, 165, 'chicken');
    loadProductToShelf('shelf-2', 'svgs/crisps.svg', 140, 175, 'crisps');
    loadProductToShelf('shelf-3', 'svgs/pineapple.svg', 20, 240, 'pineapple');
    loadProductToShelf('shelf-3', 'svgs/banana.svg', 70, 270, 'banana');
    loadProductToShelf('shelf-3', 'svgs/apple.svg', 120, 280, 'apple');
    loadProductToShelf('shelf-3', 'svgs/lettuce.svg', 158, 270, 'lettuce');
});

function loadProductToShelf(shelfId, productSvgPath, xPos, yPos, productId) {
    fetch(productSvgPath)
        .then(response => response.text())
        .then(svg => {
            const shelf = document.getElementById(shelfId);
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svg, "image/svg+xml").documentElement;

            svgDoc.classList.add('product');
            svgDoc.setAttribute('x', xPos);
            svgDoc.setAttribute('y', yPos);

            svgDoc.setAttribute('data-id', productId);

            shelf.appendChild(svgDoc);
            svgDoc.addEventListener('mousedown', (e) => onDragStartCommon(e, false));
            svgDoc.addEventListener('touchstart', (e) => onDragStartCommon(e, true));
        })
        .catch(error => console.error(`Ошибка при загрузке ${productSvgPath}:`, error));
}

let draggedElement = null;
let offsetX = 0;
let offsetY = 0;
let productsInCart = [];


const boundary = 310;

function onDragStartCommon(e, isTouch = false) {
    const product = e.target.closest('.product');

    if (product) {
        draggedElement = product;
        draggedElement.classList.add('dragging')
        const currentX = parseFloat(draggedElement.getAttribute('x')) || 0;
        const currentY = parseFloat(draggedElement.getAttribute('y')) || 0;

        if (isTouch) {
            offsetX = e.touches[0].clientX - currentX;
            offsetY = e.touches[0].clientY - currentY;
        } else {
            offsetX = e.clientX - currentX;
            offsetY = e.clientY - currentY;
        }

        document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onDrag);
        document.addEventListener(isTouch ? 'touchend' : 'mouseup', onDragEnd);
    }
}

function onDragStart(e) {
    onDragStartCommon(e, false);
}

function onTouchStart(e) {
    onDragStartCommon(e, true);
}

function onDrag(e) {
    if (!draggedElement) return;

    let newX, newY;

    if (e.touches) {
        newX = e.touches[0].clientX - offsetX;
        newY = e.touches[0].clientY - offsetY;
    } else {
        newX = e.clientX - offsetX;
        newY = e.clientY - offsetY;
    }

    draggedElement.setAttribute('x', newX);
    draggedElement.setAttribute('y', newY);

    if (newY > boundary) {
        addProductToCart(draggedElement);
    } else {
        removeProductFromCart(draggedElement);
    }
}

function onDragEnd(e) {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', onDragEnd);
    draggedElement.classList.remove('dragging')
    draggedElement = null;
}

function addProductToCart(product) {
    const productId = product.getAttribute('data-id');

    if (!productsInCart.includes(productId)) {
        productsInCart.push(productId);
        console.log(`Product added to cart: ${productId}`, productsInCart);

        if (productsInCart.length >= 3) {
            showCheckoutButton();
        }
    }
}

function removeProductFromCart(product) {
    const productId = product.getAttribute('data-id');

    const index = productsInCart.indexOf(productId);
    if (index !== -1) {
        productsInCart.splice(index, 1);
        console.log(`Product removed from cart: ${productId}`, productsInCart);
        if (productsInCart.length < 3) {
            hideCheckoutButton();
        }
    }
}

function showCheckoutButton() {
    let button = document.querySelector('#checkoutButton');
    button.classList.remove('hideButton')
    button.classList.add('button')
}

function hideCheckoutButton() {
    const button = document.querySelector('#checkoutButton');
    if (button) {
        button.classList.remove('button')
        button.classList.add('hideButton')
    }
}

document.addEventListener('mousedown', onDragStart);
document.addEventListener('touchstart', onTouchStart);
