const SiteData = {
  init() {
    if (!localStorage.getItem('siteData')) {
      const initialData = {
        totalViews: 1,
        blogPosts: 0,
        notes: 1,
        photos: 8,
        posts: {},
        lastVisit: null,
        pageViews: {},
        theme: 'dark'
      };
      localStorage.setItem('siteData', JSON.stringify(initialData));
    }
    return JSON.parse(localStorage.getItem('siteData'));
  },

  getData() {
    return JSON.parse(localStorage.getItem('siteData'));
  },

  saveData(data) {
    localStorage.setItem('siteData', JSON.stringify(data));
  },

  incrementPostViews(postId) {
    const data = this.getData();
    if (data.posts[postId]) {
      data.posts[postId].views++;
      data.totalViews++;
      this.saveData(data);
      return data.posts[postId].views;
    }
    return 0;
  },

  incrementPageViews(pageName) {
    const data = this.getData();
    if (!data.pageViews[pageName]) {
      data.pageViews[pageName] = 0;
    }
    data.pageViews[pageName]++;
    data.totalViews++;
    this.saveData(data);
    return data.pageViews[pageName];
  },

  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k+';
    }
    return num + '+';
  },

  getTheme() {
    const data = this.getData();
    return data.theme || 'dark';
  },

  setTheme(theme) {
    const data = this.getData();
    data.theme = theme;
    this.saveData(data);
  }
};

function animateNumber(element, targetValue, duration) {
  const startValue = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);

    element.textContent = SiteData.formatNumber(currentValue);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function initTheme() {
  const savedTheme = SiteData.getTheme();
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeToggle(savedTheme);
}

function updateThemeToggle(theme) {
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.innerHTML = theme === 'dark'
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  SiteData.setTheme(newTheme);
  updateThemeToggle(newTheme);
}

document.addEventListener('DOMContentLoaded', () => {
  const data = SiteData.init();
  initTheme();

  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  SiteData.incrementPageViews(currentPage);

  const statNumbers = document.querySelectorAll('.stat-card .number');
  if (statNumbers.length > 0) {
    const currentData = SiteData.getData();
    const noteViews = parseInt(localStorage.getItem('note_views_幂级数求和函数')) || 0;

    statNumbers.forEach((element) => {
      const statType = element.dataset.stat;
      let value = 0;

      switch (statType) {
        case 'blogs':
          value = currentData.blogPosts;
          break;
        case 'notes':
          value = currentData.notes;
          break;
        case 'photos':
          value = currentData.photos;
          break;
        case 'views':
          value = currentData.totalViews + noteViews;
          break;
      }

      animateNumber(element, value, 2000);
    });
  }

  const blogCount = document.querySelectorAll('.blog-card').length;
  const noteCount = document.querySelectorAll('.note-card').length;
  const photoCount = document.querySelectorAll('.gallery-item').length;

  if (blogCount > 0 || noteCount > 0 || photoCount > 0) {
    const currentData = SiteData.getData();
    if (blogCount > 0) currentData.blogPosts = blogCount;
    if (noteCount > 0) currentData.notes = noteCount;
    if (photoCount > 0) currentData.photos = photoCount;
    SiteData.saveData(currentData);
  }

  const blogCards = document.querySelectorAll('.blog-card');
  blogCards.forEach(card => {
    const viewSpan = card.querySelector('.views-count');
    if (viewSpan) {
      const postId = card.dataset.postId;
      const currentData = SiteData.getData();
      if (postId && currentData.posts[postId]) {
        viewSpan.innerHTML = `<i class="fas fa-eye"></i> ${currentData.posts[postId].views}`;
      }
    }
  });

  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger?.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (nav) {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
  });

  const categoryButtons = document.querySelectorAll('[data-category], [data-tag]');
  categoryButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const category = e.target.dataset.category || e.target.dataset.tag;

      const blogCards = document.querySelectorAll('.blog-card[data-category]');
      const noteCards = document.querySelectorAll('.note-card[data-tag]');
      const items = [...blogCards, ...noteCards];

      categoryButtons.forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      items.forEach(item => {
        const itemCategory = item.dataset.category || item.dataset.tag;
        if (category === 'all' || itemCategory === category) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  window.addNewPost = function (postId, title) {
    const data = SiteData.getData();
    data.posts[postId] = { views: 0, title: title };
    data.blogPosts++;
    SiteData.saveData(data);
    console.log(`新文章 "${title}" 已添加，ID: ${postId}`);
  };

  window.addNewNote = function () {
    const data = SiteData.getData();
    data.notes++;
    SiteData.saveData(data);
    console.log(`笔记总数: ${data.notes}`);
  };

  window.addNewPhoto = function () {
    const data = SiteData.getData();
    data.photos++;
    SiteData.saveData(data);
    console.log(`照片总数: ${data.photos}`);
  };

  window.viewData = function () {
    console.log(SiteData.getData());
  };

  const audioPlayer = document.getElementById('audioPlayer');
  const playBtn = document.getElementById('playBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressFill = document.getElementById('progressFill');
  const progressThumb = document.getElementById('progressThumb');
  const progressTrack = document.querySelector('.progress-track');
  const currentTimeEl = document.getElementById('currentTime');
  const totalTimeEl = document.getElementById('totalTime');
  const volumeSlider = document.getElementById('volumeSlider');
  const loadingIndicator = document.getElementById('loadingIndicator');

  const FADE_DURATION = 1000;
  const FADE_INTERVAL = 50;

  function fadeIn() {
    const targetVolume = volumeSlider.value / 100;
    const step = targetVolume / (FADE_DURATION / FADE_INTERVAL);
    let currentVolume = 0;

    audioPlayer.volume = 0;

    const fadeInterval = setInterval(() => {
      currentVolume += step;
      if (currentVolume >= targetVolume) {
        audioPlayer.volume = targetVolume;
        clearInterval(fadeInterval);
      } else {
        audioPlayer.volume = currentVolume;
      }
    }, FADE_INTERVAL);
  }

  function fadeOut(callback) {
    const startVolume = audioPlayer.volume;
    const step = startVolume / (FADE_DURATION / FADE_INTERVAL);
    let currentVolume = startVolume;

    const fadeInterval = setInterval(() => {
      currentVolume -= step;
      if (currentVolume <= 0) {
        audioPlayer.volume = 0;
        clearInterval(fadeInterval);
        if (callback) callback();
      } else {
        audioPlayer.volume = currentVolume;
      }
    }, FADE_INTERVAL);
  }

  if (audioPlayer) {
    playBtn.addEventListener('click', () => {
      if (audioPlayer.paused) {
        fadeIn();
        audioPlayer.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playBtn.classList.add('playing');
      } else {
        fadeOut(() => {
          audioPlayer.pause();
        });
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.classList.remove('playing');
      }
    });

    prevBtn.addEventListener('click', () => {
      if (!audioPlayer.paused) {
        fadeOut(() => {
          audioPlayer.currentTime = 0;
          fadeIn();
        });
      } else {
        audioPlayer.currentTime = 0;
      }
    });

    nextBtn.addEventListener('click', () => {
      if (!audioPlayer.paused) {
        fadeOut(() => {
          audioPlayer.currentTime = 0;
          fadeIn();
          audioPlayer.play();
        });
      } else {
        audioPlayer.currentTime = 0;
        fadeIn();
        audioPlayer.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
      }
    });

    audioPlayer.addEventListener('timeupdate', () => {
      const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressFill.style.width = `${progress}%`;
      progressThumb.style.left = `${progress}%`;

      currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
      totalTimeEl.textContent = formatTime(audioPlayer.duration);
    });

    audioPlayer.addEventListener('loadstart', () => {
      loadingIndicator.classList.add('active');
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
      loadingIndicator.classList.remove('active');
      totalTimeEl.textContent = formatTime(audioPlayer.duration);
    });

    audioPlayer.addEventListener('error', () => {
      loadingIndicator.classList.remove('active');
      console.error('音频加载失败');
    });

    progressTrack.addEventListener('click', (e) => {
      const rect = progressTrack.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * audioPlayer.duration;

      if (!audioPlayer.paused) {
        fadeOut(() => {
          audioPlayer.currentTime = newTime;
          fadeIn();
        });
      } else {
        audioPlayer.currentTime = newTime;
      }
    });

    volumeSlider.addEventListener('input', () => {
      audioPlayer.volume = volumeSlider.value / 100;
    });

    audioPlayer.addEventListener('ended', () => {
      fadeOut();
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
      playBtn.classList.remove('playing');
    });
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  window.resetData = function () {
    localStorage.removeItem('siteData');
    SiteData.init();
    console.log('数据已重置');
    location.reload();
  };

  const typewriterLines = [
    { element: 'line1', text: 'Hello,', delay: 10 },
    { element: 'line2', text: "I'm RuoYing.", delay: 10 },
    { element: 'line3', text: 'A student passionate about', delay: 10 },
    { element: 'line4', text: 'technology, mathematics, photography and writing.', delay: 8 }
  ];

  function typeWriter(elementId, text, speed, isHTML = false, callback) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.classList.add('active');
    let i = 0;

    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    element.appendChild(cursor);

    function type() {
      if (i < text.length) {
        if (isHTML) {
          element.innerHTML = text.substring(0, i + 1);
          element.appendChild(cursor);
        } else {
          element.textContent = text.substring(0, i + 1);
          element.appendChild(cursor);
        }
        i++;
        setTimeout(type, speed);
      } else {
        cursor.remove();
        if (isHTML) {
          element.innerHTML = text;
        } else {
          element.textContent = text;
        }
        if (callback) callback();
      }
    }
    type();
  }

  function startTypewriter() {
    let lineIndex = 0;

    function processLine() {
      if (lineIndex >= typewriterLines.length) return;

      const line = typewriterLines[lineIndex];

      typeWriter(line.element, line.text, line.delay, line.isHTML || false, () => {
        lineIndex++;
        setTimeout(processLine, 10);
      });
    }

    setTimeout(processLine, 700);
  }

  function animateColors() {
    const colors = [
      { purple: '#6A00FF', cyan: '#00CED1', yellow: '#FFD700' },
      { purple: '#9B59B6', cyan: '#1ABC9C', yellow: '#F39C12' },
      { purple: '#8E44AD', cyan: '#3498DB', yellow: '#E67E22' },
      { purple: '#D000FF', cyan: '#20B2AA', yellow: '#FFA500' },
    ];

    let currentIndex = 0;
    let nextIndex = 1;
    let progress = 0;
    const transitionDuration = 2000;
    const root = document.documentElement;

    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : [0, 0, 0];
    }

    function rgbToHex(rgb) {
      return '#' + rgb.map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    }

    function interpolateColor(color1, color2, factor) {
      const rgb1 = hexToRgb(color1);
      const rgb2 = hexToRgb(color2);
      return rgbToHex([
        rgb1[0] + (rgb2[0] - rgb1[0]) * factor,
        rgb1[1] + (rgb2[1] - rgb1[1]) * factor,
        rgb1[2] + (rgb2[2] - rgb1[2]) * factor
      ]);
    }

    let animationId;
    let lastTime = 0;

    function animate(currentTime) {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      progress += deltaTime / transitionDuration;

      if (progress >= 1) {
        progress = 0;
        currentIndex = nextIndex;
        nextIndex = (nextIndex + 1) % colors.length;
      }

      const currentColors = colors[currentIndex];
      const nextColors = colors[nextIndex];

      const purple = interpolateColor(currentColors.purple, nextColors.purple, progress);
      const cyan = interpolateColor(currentColors.cyan, nextColors.cyan, progress);
      const yellow = interpolateColor(currentColors.yellow, nextColors.yellow, progress);

      root.style.setProperty('--purple', purple);
      root.style.setProperty('--cyan', cyan);
      root.style.setProperty('--yellow', yellow);

      const gradientText = document.querySelector('.gradient-text');
      if (gradientText) {
        gradientText.style.background = `linear-gradient(135deg, ${purple}, ${cyan}, ${yellow})`;
        gradientText.style.webkitBackgroundClip = 'text';
        gradientText.style.webkitTextFillColor = 'transparent';
        gradientText.style.backgroundClip = 'text';
        gradientText.style.textShadow = 'none';
        gradientText.style.boxShadow = 'none';
      }

      const avatar = document.querySelector('.avatar');
      if (avatar) {
        avatar.style.borderColor = purple;
        avatar.style.boxShadow = `0 0 15px ${purple}80`;
      }

      const particles = document.querySelectorAll('.particle');
      particles.forEach((p, i) => {
        const hue = ((currentIndex + progress) * 90 + i * 30) % 360;
        p.style.background = `hsl(${hue}, 100%, 60%)`;
      });

      animationId = requestAnimationFrame(animate);
    }

    const initialColors = colors[0];
    root.style.setProperty('--purple', initialColors.purple);
    root.style.setProperty('--cyan', initialColors.cyan);
    root.style.setProperty('--yellow', initialColors.yellow);

    animationId = requestAnimationFrame(animate);
  }

  if (document.querySelector('.hero')) {
    animateColors();
  }
});
