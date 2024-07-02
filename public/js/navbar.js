const listIcon = document.querySelector('#listIcon');
const dropDown = document.querySelector('#navList');

listIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    dropDown.classList.toggle('hide');
});

dropDown.addEventListener('click', (e) => e.stopPropagation());

document.onclick = function () {
    dropDown.classList.add('hide');
}