const cartButtons = document.querySelectorAll('.cart-button');
const playButtons = document.querySelectorAll('.jugar-boton');

cartButtons.forEach(button => {
	button.addEventListener('click', cartClick);
});

playButtons.forEach(button => {
	button.addEventListener('click', playClick);
});

function cartClick() {
	let button = this;
	if (button.classList.contains('clicked')) button.classList.remove('clicked')
	else button.classList.add('clicked');
}

function playClick() {
	window.location.replace("juego.html");
}