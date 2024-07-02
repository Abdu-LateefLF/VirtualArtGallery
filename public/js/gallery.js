const closeViewBtn = document.querySelector('#viewRecord button');
const closeView = document.querySelector('#viewRecord');
const searchInput = document.querySelector('#search');
const searchBtn = document.querySelector('#searchBtn');
const infoText = document.querySelector('#info');
const shareBtn = document.querySelector('#shareBtn');
const shareView = document.querySelector('#shareGallery');
const shareViewBackBtn = document.querySelector('#shareGallery .backBtn');
const userAddPanel = document.querySelector('#userPanel');
const addUserBtn = document.querySelector('#addUser');

const sharedUsers = document.querySelector('#sharedUsers');

const deleteRecordBtns = document.querySelectorAll('.deleteBtn');

for (let deleteBtn of deleteRecordBtns) {
    deleteBtn.addEventListener('click', (e) => e.stopPropagation());
}

closeViewBtn.addEventListener('click', () => {
    closeView.classList.add('hide');
});

shareViewBackBtn?.addEventListener('click', () => {
    shareView.classList.add('hide');
});

/* Search Bar*/

async function populateSearch() {
    if (searchInput.value === '') {
        infoText.classList.add('hide');
        return;
    }

    const url = window.location.origin + `/gallery/user?search=${searchInput.value}`;

    infoText.textContent = "Searching...";
    infoText.classList.remove('hide');
    userAddPanel.classList.add('hide');

    const { data } = await axios.get(url);

    if (data.err) {
        infoText.textContent = data.err.message;
        console.log(data.err.message);
        return;
    }

    infoText.classList.add('hide');

    // Show user add panel
    userAddPanel.children[0].innerText = data.username;
    userAddPanel.children[2].value = data.username;
    userAddPanel.classList.remove('hide');

}
searchBtn?.addEventListener('click', populateSearch);

/* Handle Users */

async function addUser() {
    const url = window.location.origin + '/gallery/user';
    const username = userAddPanel.children[2].value;

    const { data } = await axios.post(url, { username });

    if (data.err) {
        console.log(data.err.message);
        return;
    }

    console.dir(data);

    searchInput.value = '';
    userAddPanel.classList.add('hide');

    getSharedUsers();
}
addUserBtn?.addEventListener('click', addUser);

// Remove shared user
async function removeSharedUser(username) {
    const url = window.location.origin + `/gallery/user?username=${username}`;

    const { data } = await axios.delete(url);

    if (data.err) {
        console.log(data.err.message);
        return;
    }

    await getSharedUsers();
}

// Make a async call to retrive all users we shared our gallery with
async function getSharedUsers() {
    const url = window.location.origin + '/gallery/users';

    const { data } = await axios.get(url);

    // Remove all shared Users being displayed
    for (let i = 0; i < sharedUsers.childElementCount; i++) {
        sharedUsers.firstElementChild.remove();
    }

    if (data.usernames?.length > 0) {
        for (let username of data.usernames) {

            const sharedUser = document.createElement('div');
            sharedUser.classList.add('user');
            sharedUser.innerHTML = `                        
                <span>${username}</span>
                <button>Remove</button>
            `;

            sharedUser.children[1].addEventListener('click', () => removeSharedUser(username));

            sharedUsers.appendChild(sharedUser);
        }

    } else {
        const notFoundSpan = document.createElement('span');
        notFoundSpan.textContent = "You haven't shared your gallery with anyone.";
        sharedUsers.appendChild(notFoundSpan);
    }
}

shareBtn?.addEventListener('click', () => {
    shareView.classList.remove('hide');
    searchInput.focus();
    getSharedUsers();
});