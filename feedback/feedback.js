document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackContainer = document.getElementById('feedback-container');
        const backendUrl = 'api/feedback.php';

    // --- Fetch and display all feedback from the Node.js backend ---
    const fetchAndDisplayFeedback = async () => {
        if (!feedbackContainer) return;
        feedbackContainer.innerHTML = '<p>Loading feedback...</p>';
        try {
            const response = await fetch(backendUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const feedbacks = await response.json();
            
            if (feedbacks.length === 0) {
                feedbackContainer.innerHTML = '<p>No feedback yet. Be the first to leave a review!</p>';
                return;
            }

            let feedbackHTML = '';
            feedbacks.forEach(feedback => {
                const date = new Date(feedback.timestamp).toLocaleString();
                
                let ratingStars = '';
                for(let i = 0; i < 5; i++){
                    if(i < feedback.rating){
                        ratingStars += '&#9733;'; // filled star
                    } else {
                        ratingStars += '&#9734;'; // empty star
                    }
                }

                feedbackHTML += `
                    <div class="feedback-card">
                        <p class="rating-display">${ratingStars}</p>
                        <p>"${feedback.message}"</p>
                        <p class="author">- ${feedback.name}</p>
                        <p class="timestamp">${date}</p>
                    </div>
                `;
            });
            feedbackContainer.innerHTML = feedbackHTML;
        } catch (error) {
            console.error("Error fetching feedback: ", error);
            feedbackContainer.innerHTML = '<p>Could not load feedback at this time. Please ensure the backend is running.</p>';
        }
    };

    // --- Handle form submission to the Node.js backend ---
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = feedbackForm.name.value.trim();
            const message = feedbackForm.message.value.trim();
            const rating = feedbackForm.rating.value;

            if (!name || !message || !rating) {
                alert('Please fill out all fields and provide a rating.');
                return;
            }

            const feedbackData = { 
                name, 
                message, 
                rating: Number(rating)
            };

            try {
                const response = await fetch(backendUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(feedbackData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Thank you for your feedback!');
                    feedbackForm.reset();
                    fetchAndDisplayFeedback(); // Refresh feedback list
                } else {
                    alert(result.msg || 'There was an error submitting your feedback.');
                }
            } catch (error) {
                console.error("Error submitting feedback:", error);
                alert('There was a network error submitting your feedback. Please try again.');
            }
        });
    }

    // Initial fetch of feedback
    fetchAndDisplayFeedback();
});