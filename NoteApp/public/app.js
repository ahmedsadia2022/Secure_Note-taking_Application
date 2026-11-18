const API_URL = '/api'; 



async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const interests = document.getElementById('interests').value.split(',').map(i => i.trim());

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role: 'user', interests })
        });
        const data = await res.json();
        
        if (res.ok) {
            document.getElementById('auth-msg').innerText = "Registered! Now login.";
            document.getElementById('auth-msg').style.color = "green";
        } else {
            document.getElementById('auth-msg').innerText = data.message;
        }
    } catch (err) {
        console.error(err);
    }
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            document.getElementById('auth-section').classList.add('hidden');
            document.getElementById('notes-section').classList.remove('hidden');
            loadNotes();
        } else {
            document.getElementById('auth-msg').innerText = data.message;
        }
    } catch (err) {
        console.error(err);
    }
}

function logout() {
    localStorage.removeItem('token');
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('notes-section').classList.add('hidden');
}

async function loadNotes() {
    const token = localStorage.getItem('token');
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = 'Loading...';

    try {
        const res = await fetch(`${API_URL}/notes?page=1&limit=50`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        notesList.innerHTML = '';
        
        if (data.notes && data.notes.length > 0) {
            data.notes.forEach(note => {
                const div = document.createElement('div');
                div.className = 'note-item';
                div.innerHTML = `
                    <div>
                        <strong>${note.title}</strong><br>
                        <small>${note.content}</small>
                    </div>
                    <button onclick="deleteNote('${note._id}')" style="background: red;">X</button>
                `;
                notesList.appendChild(div);
            });
        } else {
            notesList.innerHTML = '<p>No notes found.</p>';
        }
    } catch (err) {
        console.error(err);
    }
}

async function createNote() {
    const token = localStorage.getItem('token');
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;

    if (!title || !content) return alert("Please fill both fields");

    try {
        const res = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ title, content })
        });

        if (res.ok) {
            document.getElementById('note-title').value = '';
            document.getElementById('note-content').value = '';
            loadNotes(); 
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteNote(id) {
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${API_URL}/notes/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            loadNotes(); 
        }
    } catch (err) {
        console.error(err);
    }
}

// logged in or not
if (localStorage.getItem('token')) {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('notes-section').classList.remove('hidden');
    loadNotes();
}