/**
 * 章节大纲组件 (Outline / TOC)
 * 自动解析文章内容中的标题（h2-h6），生成层级式大纲列表
 */
(function () {
  'use strict';

  var config = {
    contentSelector: '.post-content, .note-content',
    headingSelector: 'h2, h3, h4, h5, h6',
    scrollOffset: 100,
    desktopBreakpoint: 1100,
    minHeadings: 2
  };

  var headings = [];
  var isDrawerOpen = false;
  var sidebar, fab, drawer, overlay;

  function init() {
    var contentEl = document.querySelector(config.contentSelector);
    if (!contentEl) return;

    headings = Array.from(contentEl.querySelectorAll(config.headingSelector));
    if (headings.length < config.minHeadings) return;

    headings.forEach(function (heading, index) {
      if (!heading.id) heading.id = 'heading-' + (index + 1);
      heading.setAttribute('data-outline-index', index);
    });

    buildDesktopSidebar();
    buildMobileDrawer();
    setupScrollSpy();
    setupSmoothScroll();
  }

  function buildDesktopSidebar() {
    sidebar = document.createElement('nav');
    sidebar.className = 'outline-sidebar outline-hidden';
    sidebar.setAttribute('aria-label', '文章大纲');

    var html = '<div class="outline-title"><i class="fas fa-list-ul"></i><span>目录</span></div><ul class="outline-list">';
    headings.forEach(function (heading, index) {
      var level = parseInt(heading.tagName.substring(1));
      var text = heading.textContent.trim();
      html += '<li><a class="outline-link" data-level="' + level + '" data-index="' + index + '" href="#' + heading.id + '" title="' + escapeHtml(text) + '">' + escapeHtml(text) + '</a></li>';
    });
    html += '</ul>';

    sidebar.innerHTML = html;
    document.body.appendChild(sidebar);

    setTimeout(function () {
      sidebar.classList.remove('outline-hidden');
    }, 500);
  }

  /**
   * 构建移动端抽屉 — 全部使用 DOM API 创建，不依赖 innerHTML
   * 确保事件监听器直接绑定到真实 DOM 节点
   */
  function buildMobileDrawer() {
    // 悬浮按钮
    fab = document.createElement('button');
    fab.className = 'outline-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', '打开目录');
    fab.innerHTML = '<i class="fas fa-list-ul"></i>';
    fab.addEventListener('click', function () {
      console.log('[outline] FAB clicked');
      openDrawer();
    });
    document.body.appendChild(fab);

    // 遮罩层
    overlay = document.createElement('div');
    overlay.className = 'outline-overlay';
    overlay.addEventListener('click', closeDrawer);
    document.body.appendChild(overlay);

    // 抽屉面板
    drawer = document.createElement('nav');
    drawer.className = 'outline-drawer';
    drawer.setAttribute('aria-label', '文章大纲');

    // --- 用 DOM API 构建 header ---
    var header = document.createElement('div');
    header.className = 'outline-drawer-header';

    var titleDiv = document.createElement('div');
    titleDiv.className = 'outline-title';
    titleDiv.innerHTML = '<i class="fas fa-list-ul"></i><span>目录</span>';
    header.appendChild(titleDiv);

    // 关闭按钮 — DOM 创建 + 直接绑定事件
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'outline-drawer-close';
    closeBtn.setAttribute('aria-label', '关闭目录');
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';

    // 核心：直接在 DOM 元素上绑定 click
    closeBtn.addEventListener('click', function (e) {
      console.log('[outline] close button clicked, isDrawerOpen =', isDrawerOpen);
      e.preventDefault();
      e.stopPropagation();
      closeDrawer();
      console.log('[outline] after closeDrawer, isDrawerOpen =', isDrawerOpen);
    });

    header.appendChild(closeBtn);
    drawer.appendChild(header);

    // --- 大纲列表 ---
    var list = document.createElement('ul');
    list.className = 'outline-list';
    headings.forEach(function (heading, index) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'outline-link';
      a.setAttribute('data-level', parseInt(heading.tagName.substring(1)));
      a.setAttribute('data-index', index);
      a.href = '#' + heading.id;
      a.textContent = heading.textContent.trim();
      li.appendChild(a);
      list.appendChild(li);
    });
    drawer.appendChild(list);

    document.body.appendChild(drawer);
  }

  function openDrawer() {
    console.log('[outline] openDrawer() called, isDrawerOpen =', isDrawerOpen);
    if (isDrawerOpen) return;
    isDrawerOpen = true;

    drawer.classList.add('outline-drawer-open');
    overlay.classList.add('outline-overlay-show');
    drawer.style.transform = 'translateY(0)';
    drawer.style.visibility = 'visible';
    drawer.style.pointerEvents = 'auto';
    overlay.style.opacity = '1';
    overlay.style.visibility = 'visible';
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    console.log('[outline] closeDrawer() called, isDrawerOpen =', isDrawerOpen);
    if (!isDrawerOpen) return;
    isDrawerOpen = false;

    drawer.classList.remove('outline-drawer-open');
    overlay.classList.remove('outline-overlay-show');
    drawer.style.transform = 'translateY(100%)';
    drawer.style.visibility = 'hidden';
    drawer.style.pointerEvents = 'none';
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
    document.body.style.overflow = '';
  }

  // 全局暴露，供 onclick 调用
  window.__closeOutlineDrawer = closeDrawer;

  function setupSmoothScroll() {
    var allLinks = document.querySelectorAll('.outline-link');
    Array.prototype.forEach.call(allLinks, function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var index = parseInt(link.getAttribute('data-index'));
        var target = headings[index];
        if (!target) return;

        var rect = target.getBoundingClientRect();
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({
          top: rect.top + scrollTop - config.scrollOffset,
          behavior: 'smooth'
        });

        if (window.innerWidth <= config.desktopBreakpoint) {
          closeDrawer();
        }
      });
    });
  }

  var scrollTimer = null;
  function setupScrollSpy() {
    window.addEventListener('scroll', function () {
      if (scrollTimer) cancelAnimationFrame(scrollTimer);
      scrollTimer = requestAnimationFrame(updateActiveOutline);
    });
    updateActiveOutline();
  }

  function updateActiveOutline() {
    var activeIndex = -1;
    var scrollPos = window.pageYOffset || document.documentElement.scrollTop;

    for (var i = 0; i < headings.length; i++) {
      var rect = headings[i].getBoundingClientRect();
      var top = rect.top + window.pageYOffset - config.scrollOffset;
      if (scrollPos >= top - 10) {
        activeIndex = i;
      } else {
        break;
      }
    }

    if (activeIndex === -1 && scrollPos < headings[0].offsetTop) {
      activeIndex = 0;
    }
    if (activeIndex === -1) return;

    var allLinks = document.querySelectorAll('.outline-link');
    Array.prototype.forEach.call(allLinks, function (link) {
      var linkIndex = parseInt(link.getAttribute('data-index'));
      if (linkIndex === activeIndex) {
        link.classList.add('outline-active');
        if (sidebar && link.closest('.outline-sidebar')) {
          var linkRect = link.getBoundingClientRect();
          var sidebarRect = sidebar.getBoundingClientRect();
          if (linkRect.top < sidebarRect.top || linkRect.bottom > sidebarRect.bottom) {
            link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      } else {
        link.classList.remove('outline-active');
      }
    });
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
