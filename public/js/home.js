const clearFiltBtn = document.querySelector('#clearFilterBtn');
const addToGalleryView = document.querySelector('#addToGalleryView');
const objectIdInput = document.querySelector('#addToGalleryView .objectId');
const commentInput = document.querySelector('#addToGalleryView textarea');
const showViewBtns = document.querySelectorAll('.record .addBtn');
const saveBtn = document.querySelector('#saveBtn');
const closeBtn = document.querySelector('#closeBtn');

// Set all filters to default when this is pressed
clearFiltBtn.addEventListener('click', (e) => {
    const filters = document.querySelectorAll('select');

    for (let filter of filters) {
        filter.selectedIndex = 0;
    }
});

// Make the 'Add to Gallery' form appear

const displayForm = function (e) {
    e.preventDefault();
    objectIdInput.value = this.id;
    addToGalleryView.classList.remove('hide');
    commentInput.focus();
}

for (let viewBtn of showViewBtns) {
    viewBtn.addEventListener('click', displayForm);
}

// Make the 'Add to Gallery' form disappear
const hideForm = function (e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    objectIdInput.value = '';
    commentInput.value = '';
    addToGalleryView.classList.add('hide');
}
closeBtn.addEventListener('click', hideForm);

const saveRecordToGallery = async function (e) {
    e.preventDefault();

    const id = objectIdInput.value.slice(2);

    let comment = commentInput.value;
    if (comment === '') {
        comment = 'No comment.'
    }

    const viewBtn = document.querySelector('#' + objectIdInput.value);

    try {
        const url = window.location.origin + '/gallery';
        const response = await axios.post(url, { id, comment });

        if (response.err) throw Error(err.message);

        viewBtn.textContent = 'Saved';
        viewBtn.classList.add('added');

        hideForm();
    }
    catch (e) {
        console.log(e);
    }
}

saveBtn.addEventListener('click', saveRecordToGallery);
