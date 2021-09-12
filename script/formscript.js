
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector('.tetris__form'),
        input = document.getElementById("username");

    if (localStorage.getItem("username") !== null) {
        input.value = localStorage.getItem("username");
    }
    form.addEventListener('submit', e => {
        if (input.value.trim() === "") {
            e.preventDefault();
            alert("Введите имя пользователя!");
        } else {
            localStorage.setItem('username', input.value);
        }
    });

});