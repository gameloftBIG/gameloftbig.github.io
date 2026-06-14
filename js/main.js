// 数据管理系统
const SiteData = {
  // 初始化数据
  init() {
    if (!localStorage.getItem('siteData')) {
      const initialData = {
        totalViews: 1,
        blogPosts: 0,
        notes: 1,
        photos: 8,
        posts: {},
        lastVisit: null,
        pageViews: {}
      };
      localStorage.setItem('siteData', JSON.stringify(initialData));
    }
    return JSON.parse(localStorage.getItem('siteData'));
  },

  // 获取数据
  getData() {
    return JSON.parse(localStorage.getItem('siteData'));
  },

  // 保存数据
  saveData(data) {
    localStorage.setItem('siteData', JSON.stringify(data));
  },

  // 增加文章浏览量
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

  // 增加页面浏览量
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

  // 格式化数字显示
  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k+';
    }
    return num + '+';
  }
};

// 数字递增动画函数
function animateNumber(element, targetValue, duration) {
  const startValue = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // 使用缓动函数使动画更流畅
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);

    element.textContent = SiteData.formatNumber(currentValue);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  // 初始化数据
  const data = SiteData.init();

  // 记录当前页面访问
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  SiteData.incrementPageViews(currentPage);

  // 更新统计数据显示（首页）
  const statNumbers = document.querySelectorAll('.stat-card .number');
  if (statNumbers.length > 0) {
    const currentData = SiteData.getData();

    // 获取笔记的真实浏览次数
    const noteViews = parseInt(localStorage.getItem('note_views_幂级数求和函数')) || 0;

    // 根据data-stat属性设置对应的值
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
          // 浏览次数 = 总浏览量 + 笔记浏览次数
          value = currentData.totalViews + noteViews;
          break;
      }

      animateNumber(element, value, 2000);
    });
  }

  // 各页面加载时更新内容计数到 localStorage
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

  // 更新博客卡片浏览量
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

  // 导航栏功能
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

  // 导航栏滚动效果
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

  // 分类筛选功能
  const categoryButtons = document.querySelectorAll('[data-category], [data-tag]');
  categoryButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const category = e.target.dataset.category || e.target.dataset.tag;

      // 只筛选卡片元素，不筛选按钮
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

  // 添加新文章功能（可通过控制台调用）
  window.addNewPost = function (postId, title) {
    const data = SiteData.getData();
    data.posts[postId] = { views: 0, title: title };
    data.blogPosts++;
    SiteData.saveData(data);
    console.log(`新文章 "${title}" 已添加，ID: ${postId}`);
  };

  // 添加新笔记功能
  window.addNewNote = function () {
    const data = SiteData.getData();
    data.notes++;
    SiteData.saveData(data);
    console.log(`笔记总数: ${data.notes}`);
  };

  // 添加新照片功能
  window.addNewPhoto = function () {
    const data = SiteData.getData();
    data.photos++;
    SiteData.saveData(data);
    console.log(`照片总数: ${data.photos}`);
  };

  // 查看当前数据
  window.viewData = function () {
    console.log(SiteData.getData());
  };

  // 音乐播放器功能
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

  // 淡入淡出效果参数
  const FADE_DURATION = 1000; // 淡入淡出时长（毫秒）
  const FADE_INTERVAL = 50; // 每次调整音量的间隔

  // 淡入效果
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

  // 淡出效果
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
    // 播放/暂停按钮（带淡入淡出）
    playBtn.addEventListener('click', () => {
      if (audioPlayer.paused) {
        fadeIn();
        audioPlayer.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        fadeOut(() => {
          audioPlayer.pause();
        });
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
      }
    });

    // 上一首（模拟，带淡出后重置）
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

    // 下一首（模拟，重新播放，带淡出后重新淡入）
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

    // 更新进度条
    audioPlayer.addEventListener('timeupdate', () => {
      const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressFill.style.width = `${progress}%`;
      progressThumb.style.left = `${progress}%`;

      // 更新时间显示
      currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
      totalTimeEl.textContent = formatTime(audioPlayer.duration);
    });

    // 音频加载完成
    audioPlayer.addEventListener('loadedmetadata', () => {
      totalTimeEl.textContent = formatTime(audioPlayer.duration);
    });

    // 进度条点击跳转（带淡出后重新淡入）
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

    // 音量控制
    volumeSlider.addEventListener('input', () => {
      audioPlayer.volume = volumeSlider.value / 100;
    });

    // 播放结束（带淡出）
    audioPlayer.addEventListener('ended', () => {
      fadeOut();
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
  }

  // 格式化时间
  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // 重置数据
  window.resetData = function () {
    localStorage.removeItem('siteData');
    SiteData.init();
    console.log('数据已重置');
    location.reload();
  };

  // 打字机效果 - 定义要显示的文本和速度（整体在0.8秒内完成）
  const typewriterLines = [
    { element: 'line1', text: 'Hello,', delay: 10 },       // 6字符 * 10ms = 60ms
    { element: 'line2', text: "I'm RuoYing.", delay: 10 }, // 14字符 * 10ms = 140ms
    { element: 'line3', text: 'A student passionate about', delay: 10 }, // 27字符 * 10ms = 270ms
    { element: 'line4', text: 'technology, mathematics, photography and writing.', delay: 8 } // 50字符 * 8ms = 400ms
  ];

  function typeWriter(elementId, text, speed, isHTML = false, callback) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.classList.add('active');
    let i = 0;

    // 添加光标
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
        // 打字完成后立即移除光标并执行回调
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

      // 依次处理每一行
      typeWriter(line.element, line.text, line.delay, line.isHTML || false, () => {
        lineIndex++;
        setTimeout(processLine, 10); // 行之间极短延迟
      });
    }

    // 等待滑动动画完成后开始打字（滑动动画0.6秒 + 0.1秒缓冲）
    setTimeout(processLine, 700);
  }

  // 动态颜色渐变效果
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
    const transitionDuration = 2000; // 渐变过渡时长（毫秒）
    const root = document.documentElement;

    // 将十六进制颜色转换为RGB数组
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : [0, 0, 0];
    }

    // 将RGB数组转换为十六进制颜色
    function rgbToHex(rgb) {
      return '#' + rgb.map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    }

    // 在两个颜色之间插值
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

      // 更新进度
      progress += deltaTime / transitionDuration;

      if (progress >= 1) {
        progress = 0;
        currentIndex = nextIndex;
        nextIndex = (nextIndex + 1) % colors.length;
      }

      const currentColors = colors[currentIndex];
      const nextColors = colors[nextIndex];

      // 插值计算当前颜色
      const purple = interpolateColor(currentColors.purple, nextColors.purple, progress);
      const cyan = interpolateColor(currentColors.cyan, nextColors.cyan, progress);
      const yellow = interpolateColor(currentColors.yellow, nextColors.yellow, progress);

      // 更新 CSS 变量
      root.style.setProperty('--purple', purple);
      root.style.setProperty('--cyan', cyan);
      root.style.setProperty('--yellow', yellow);

      // 更新渐变文字效果
      const gradientText = document.querySelector('.gradient-text');
      if (gradientText) {
        gradientText.style.background = `linear-gradient(135deg, ${purple}, ${cyan}, ${yellow})`;
        gradientText.style.webkitBackgroundClip = 'text';
        gradientText.style.webkitTextFillColor = 'transparent';
        gradientText.style.backgroundClip = 'text';
        gradientText.style.textShadow = 'none';
        gradientText.style.boxShadow = 'none';
      }

      // 更新头像边框和阴影
      const avatar = document.querySelector('.avatar');
      if (avatar) {
        avatar.style.borderColor = purple;
        avatar.style.boxShadow = `0 0 15px ${purple}80`;
      }

      // 更新粒子颜色
      const particles = document.querySelectorAll('.particle');
      particles.forEach((p, i) => {
        const hue = ((currentIndex + progress) * 90 + i * 30) % 360;
        p.style.background = `hsl(${hue}, 100%, 60%)`;
      });

      animationId = requestAnimationFrame(animate);
    }

    // 初始设置
    const initialColors = colors[0];
    root.style.setProperty('--purple', initialColors.purple);
    root.style.setProperty('--cyan', initialColors.cyan);
    root.style.setProperty('--yellow', initialColors.yellow);

    // 开始持续渐变动画
    animationId = requestAnimationFrame(animate);
  }

  // 在首页执行颜色动画
  if (document.querySelector('.hero')) {
    animateColors();
  }
});