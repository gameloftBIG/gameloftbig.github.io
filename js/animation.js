document.addEventListener('DOMContentLoaded', () => {
  const albumCards = document.querySelectorAll('.album-card');
  const albumModal = document.getElementById('albumModal');
  const imageModal = document.getElementById('imageModal');
  const zoomImage = document.getElementById('zoomImage');
  const zoomTitle = document.getElementById('zoomTitle');
  const zoomDate = document.getElementById('zoomDate');

  let currentImageIndex = 0;
  let imageItems = [];
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let translateX = 0;
  let translateY = 0;
  let scale = 1;

  albumCards.forEach(card => {
    card.addEventListener('click', () => {
      openAlbumModal();
    });
  });

  function openAlbumModal() {
    albumModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    imageItems = Array.from(document.querySelectorAll('.album-image-item'));

    imageItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        currentImageIndex = index;
        openImageModal(index);
      });
    });
  }

  function closeAlbumModal() {
    albumModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function openImageModal(index) {
    const item = imageItems[index];
    const src = item.dataset.src;
    const title = item.dataset.title;
    const date = item.dataset.date;

    zoomImage.src = src;
    zoomImage.alt = title;
    zoomTitle.textContent = title;
    zoomDate.textContent = date;

    scale = 1;
    translateX = 0;
    translateY = 0;
    updateZoomImageTransform();
    zoomImage.classList.remove('zoomed');

    imageModal.classList.add('active');
  }

  function closeImageModal() {
    imageModal.classList.remove('active');
    zoomImage.src = '';
    scale = 1;
    translateX = 0;
    translateY = 0;
  }

  function prevZoomImage() {
    currentImageIndex = (currentImageIndex - 1 + imageItems.length) % imageItems.length;
    openImageModal(currentImageIndex);
  }

  function nextZoomImage() {
    currentImageIndex = (currentImageIndex + 1) % imageItems.length;
    openImageModal(currentImageIndex);
  }

  function updateZoomImageTransform() {
    zoomImage.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
  }

  zoomImage.addEventListener('mousedown', (e) => {
    if (scale > 1) {
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      zoomImage.style.cursor = 'grabbing';
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateZoomImageTransform();
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    zoomImage.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
  });

  zoomImage.addEventListener('wheel', (e) => {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(1, Math.min(3, scale + delta));

    const rect = zoomImage.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const imageWidth = zoomImage.naturalWidth || zoomImage.width;
    const imageHeight = zoomImage.naturalHeight || zoomImage.height;

    const percentX = mouseX / rect.width;
    const percentY = mouseY / rect.height;

    translateX -= (percentX * imageWidth) * (newScale - scale);
    translateY -= (percentY * imageHeight) * (newScale - scale);

    scale = newScale;
    updateZoomImageTransform();

    zoomImage.classList.toggle('zoomed', scale > 1);
    zoomImage.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
  });

  zoomImage.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1 && scale > 1) {
      isDragging = true;
      startX = e.touches[0].clientX - translateX;
      startY = e.touches[0].clientY - translateY;
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      startX = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      startY = scale;
    }
  }, { passive: true });

  zoomImage.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
      translateX = e.touches[0].clientX - startX;
      translateY = e.touches[0].clientY - startY;
      updateZoomImageTransform();
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const scaleChange = currentDistance / startX;
      scale = Math.max(1, Math.min(3, startY * scaleChange));
      updateZoomImageTransform();
      zoomImage.classList.toggle('zoomed', scale > 1);
    }
  }, { passive: true });

  zoomImage.addEventListener('touchend', () => {
    isDragging = false;
  });

  let touchStartX = 0;
  let touchEndX = 0;

  imageModal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  imageModal.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextZoomImage();
      } else {
        prevZoomImage();
      }
    }
  }

  document.addEventListener('keydown', (e) => {
    if (albumModal.classList.contains('active') && e.key === 'Escape') {
      closeAlbumModal();
    }

    if (imageModal.classList.contains('active')) {
      if (e.key === 'Escape') {
        if (scale > 1) {
          scale = 1;
          translateX = 0;
          translateY = 0;
          updateZoomImageTransform();
          zoomImage.classList.remove('zoomed');
        } else {
          closeImageModal();
        }
      }
      if (e.key === 'ArrowLeft') prevZoomImage();
      if (e.key === 'ArrowRight') nextZoomImage();
    }
  });

  albumModal.addEventListener('click', (e) => {
    if (e.target === albumModal) {
      closeAlbumModal();
    }
  });

  imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
      closeImageModal();
    }
  });

  window.closeAlbumModal = closeAlbumModal;
  window.closeImageModal = closeImageModal;
  window.prevZoomImage = prevZoomImage;
  window.nextZoomImage = nextZoomImage;

  zoomImage.addEventListener('error', () => {
    console.error('图片加载失败:', zoomImage.src);
  });
});