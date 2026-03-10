document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('carousel');
    const cards = document.querySelectorAll('.card');
    const dotsContainer = document.getElementById('navDots');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let currentIndex = 0;
    const totalCards = cards.length;

    // Create dots
    cards.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToCard(i));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    function updateCarousel() {
        cards.forEach((card, i) => {
            card.classList.remove('active', 'prev', 'next');
            if (i === currentIndex) {
                card.classList.add('active');
            } else if (i < currentIndex) {
                card.classList.add('prev');
            } else {
                card.classList.add('next');
            }
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    function goToCard(index) {
        currentIndex = index;
        updateCarousel();
    }

    function nextCard() {
        currentIndex = (currentIndex + 1) % totalCards;
        updateCarousel();
    }

    function prevCard() {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        updateCarousel();
    }

    nextBtn.addEventListener('click', nextCard);
    prevBtn.addEventListener('click', prevCard);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextCard();
        if (e.key === 'ArrowLeft') prevCard();
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) nextCard();
        if (touchEndX > touchStartX + 50) prevCard();
    }
});
