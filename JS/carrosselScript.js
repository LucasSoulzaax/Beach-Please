
(function() {
  let currentSlide = 0;
  let totalSlides = 0;
  let wrapper = null;
  let dots = [];
  let dotsContainer = null;
  let touchStartX = 0;
  let touchEndX = 0;


  function init() {
    wrapper = document.getElementById('carouselWrapper');
    dotsContainer = document.getElementById('carouselDots');
    
    if (!wrapper || !dotsContainer) {
      console.error('Elementos do carrossel não encontrados!');
      return;
    }


    const slides = wrapper.querySelectorAll('.carousel-slide');
    totalSlides = slides.length;

    console.log(`✅ Total de slides: ${totalSlides}`);


    createDots();

    setupNavigationButtons();


    setupTouchGestures();

  
    updateCarousel();

  
    setupKeyboardNavigation();

    console.log(`✅ Carrossel inicializado!`);
  }

 
  function setupNavigationButtons() {
    const prevButton = document.querySelector('.arrow-left');
    const nextButton = document.querySelector('.arrow-right');

    if (prevButton) {
      prevButton.removeAttribute('onclick');
      prevButton.addEventListener('click', function(e) {
        e.preventDefault();
        prevSlide();
      });
    }

    if (nextButton) {
      nextButton.removeAttribute('onclick');
      nextButton.addEventListener('click', function(e) {
        e.preventDefault();
        nextSlide();
      });
    }
  }


  function setupTouchGestures() {
    const container = document.querySelector('.carousel-container');
    
    if (container) {
      container.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      container.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });
    }
  }

  function handleSwipe() {
    const swipeThreshold = 50; 
    
    if (touchEndX < touchStartX - swipeThreshold) {
    
      nextSlide();
    }
    
    if (touchEndX > touchStartX + swipeThreshold) {

      prevSlide();
    }
  }


  function createDots() {
    dotsContainer.innerHTML = '';
    dots = [];

    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      if (i === 0) dot.classList.add('active');
      
  
      dot.addEventListener('click', (function(index) {
        return function() {
          goToSlide(index);
        };
      })(i));

      dotsContainer.appendChild(dot);
      dots.push(dot);
    }
  }

  
  function updateCarousel() {
    if (!wrapper) {
      console.error('Wrapper não encontrado!');
      return;
    }

    const translateValue = -(currentSlide * 100);
    wrapper.style.transform = `translateX(${translateValue}%)`;
    
    dots.forEach((dot, index) => {
      if (index === currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }


  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
  }


  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
  }

 
  function goToSlide(index) {
    if (index >= 0 && index < totalSlides) {
      currentSlide = index;
      updateCarousel();
    }
  }


  function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    });
  }


  window.reinitCarousel = function() {
    init();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();