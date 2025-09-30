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
    const googleProvider = new firebase.auth.GoogleAuthProvider();

    // DOM Elements
    const loginFormContainer = document.getElementById('login-form-container');
    const signupFormContainer = document.getElementById('signup-form-container');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const googleSigninBtn = document.getElementById('google-signin-btn');
    const googleSignupBtn = document.getElementById('google-signup-btn');

    // --- Toggle Forms ---
    const showSignupForm = () => {
        loginFormContainer.style.display = 'none';
        signupFormContainer.style.display = 'block';
    };

    const showLoginForm = () => {
        signupFormContainer.style.display = 'none';
        loginFormContainer.style.display = 'block';
    };

    if (showSignup) showSignup.addEventListener('click', (e) => { e.preventDefault(); showSignupForm(); });
    if (showLogin) showLogin.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); });

    // Check for #signup hash in URL to show signup form directly
    if (window.location.hash === '#signup') {
        showSignupForm();
    }

    // --- Email/Password Signup ---
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    alert('Signup successful! Redirecting to homepage...');
                    window.location.href = '../index.html';
                })
                .catch((error) => alert(`Error: ${error.message}`));
        });
    }

    // --- Email/Password Login ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    alert('Login successful! Redirecting to homepage...');
                    window.location.href = '../index.html';
                })
                .catch((error) => alert(`Error: ${error.message}`));
        });
    }

    // --- Google Sign-In ---
    const handleGoogleSignIn = () => {
        auth.signInWithPopup(googleProvider)
            .then((result) => {
                alert('Google sign-in successful! Redirecting to homepage...');
                window.location.href = '../index.html';
            }).catch((error) => alert(`Google sign-in error: ${error.message}`));
    };

    if (googleSigninBtn) googleSigninBtn.addEventListener('click', handleGoogleSignIn);
    if (googleSignupBtn) googleSignupBtn.addEventListener('click', handleGoogleSignIn);
});
