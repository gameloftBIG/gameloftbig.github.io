document.addEventListener('DOMContentLoaded', () => {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const modal = document.getElementById('galleryModal');
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalDate = document.getElementById('modalDate');

  let currentIndex = 0;
  let itemsArray = [];

  galleryItems.forEach((item, index) => {
    itemsArray.push({
      index: index,
      title: item.querySelector('.gallery-info h4').textContent,
      date: item.querySelector('.gallery-info p').textContent,
      image: item.querySelector('.gallery-image').style.background
    });

    item.addEventListener('click', () => {
      currentIndex = index;
      openModal(index);
    });
  });

  function openModal(index) {
    const item = itemsArray[index];
    modalTitle.textContent = item.title;
    modalDate.textContent = item.date;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + itemsArray.length) % itemsArray.length;
    openModal(currentIndex);
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % itemsArray.length;
    openModal(currentIndex);
  }

  window.closeModal = closeModal;
  window.prevImage = prevImage;
  window.nextImage = nextImage;

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;

    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
});