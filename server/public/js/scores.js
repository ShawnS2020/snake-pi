const body = document.getElementsByTagName("body")[0];
body.style.height = window.innerHeight + "px";
const homeBtn = document.getElementById("home");

homeBtn.addEventListener('click', () => {
    window.location.href = '/';
});