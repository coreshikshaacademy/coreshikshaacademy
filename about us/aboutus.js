document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll('.animated');

  if (!animatedElements.length) {
    return;
  }

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Optional: unobserve after animation
        // observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1 // Trigger when 10% of the element is visible
  });

  animatedElements.forEach(element => {
    observer.observe(element);
  });

  // Handle contact form submission for a better user experience
  const contactForm = document.getElementById('contactForm');
  if(contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const button = contactForm.querySelector('button[type="submit"]');
        button.textContent = 'Sending...';
        
        // Simulate a network request
        setTimeout(() => {
            button.textContent = 'Message Sent!';
            button.style.background = 'linear-gradient(90deg, #28a745, #218838)'; // Green gradient for success
            contactForm.reset();
            
            setTimeout(() => {
                button.textContent = 'Send Message';
                button.style.background = ''; // Revert to original style
            }, 3000);

        }, 1500);
    });
  }
});