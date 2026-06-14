document.addEventListener('DOMContentLoaded', () => {
  const categoryButtons = document.querySelectorAll('.category-filter button');
  const blogCards = document.querySelectorAll('.blog-card');

  categoryButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const category = e.target.dataset.category;

      categoryButtons.forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      blogCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});