document.addEventListener('DOMContentLoaded', () => {
    // 🔽 IMPORTANT: Replace with your real Firebase config from the Firebase console.
    const firebaseConfig = {
        apiKey: "AIzaSyBsk80iJ14_Lulkb7IZglNjBxyUJVlRTBs",
        authDomain: "core-21-fe146.firebaseapp.com",
        projectId: "core-21-fe146",
        storageBucket: "core-21-fe146.firebasestorage.app",
        messagingSenderId: "545635112603",
        appId: "1:545635112603:web:0ec2592d7bf2ae4b89d83e",
        measurementId: "G-KMY5YFWZVJ"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();

    const authButtonsContainer = document.getElementById('auth-buttons-container');

    auth.onAuthStateChanged(user => {
        if (!authButtonsContainer) return;

        authButtonsContainer.innerHTML = ''; // Clear previous buttons

        if (user) {
            // User is signed in
            const userDisplayName = user.displayName || user.email;
            authButtonsContainer.innerHTML = `
                <span style="color: white; margin-right: 15px; align-self: center;">Hi, ${userDisplayName}</span>
                <button id="logout-btn" class="cta-btn" style="background-color: #d9534f; border:none; cursor:pointer;">Logout</button>
            `;
            document.getElementById('logout-btn').addEventListener('click', () => {
                auth.signOut().then(() => {
                    alert('Logged out successfully!');
                    window.location.reload();
                });
            });
        } else {
            // User is signed out
            authButtonsContainer.innerHTML = `
                <a href="/auth/auth.html" class="cta-btn">Login</a>
                <a href="/auth/auth.html#signup" class="cta-btn">Sign Up</a>
                <a href="/registration/registration.html" class="cta-btn">Enroll Now</a>
            `;
        }
    });
});
