/**
 * 章节大纲组件 (Outline / TOC)
 * 自动解析文章内容中的标题（h2-h6），生成层级式大纲列表
 * 功能：锚点平滑滚动、滚动高亮、桌面端侧边栏、移动端折叠抽屉
 *
 * 使用方式：在页面底部引入此脚本即可自动初始化
 * 自动检测 .post-content 或 .note-content 容器中的标题
 */
(function () {
  'use strict';

  /** 配置项 */
  var config = {
    contentSelector: '.post-content, .note-content',
    headingSelector: 'h2, h3, h4, h5, h6',
    scrollOffset: 100,        // 滚动偏移量（导航栏高度）
    desktopBreakpoint: 1100,  // 桌面端断点
    minHeadings: 2            // 最少标题数才显示大纲
  };

  var headings = [];
  var outlineLinks = [];

  /** DOM 引用 */
  var sidebar, fab, drawer, overlay;

  /**
   * 初始化
   */
  function init() {
    var contentEl = document.querySelector(config.contentSelector);
    if (!contentEl) return;

    headings = Array.from(contentEl.querySelectorAll(config.headingSelector));
    if (headings.length < config.minHeadings) return;

    // 为每个标题添加 id（如果没有的话）
    headings.forEach(function (heading, index) {
      if (!heading.id) {
        heading.id = 'heading-' + (index + 1);
      }
      heading.setAttribute('data-outline-index', index);
    });

    buildDesktopSidebar();
    buildMobileDrawer();
    setupScrollSpy();
    setupSmoothScroll();
  }

  /**
   * 构建桌面端侧边栏
   */
  function buildDesktopSidebar() {
    sidebar = document.createElement('nav');
    sidebar.className = 'outline-sidebar outline-hidden';
    sidebar.setAttribute('aria-label', '文章大纲');

    var html = '<div class="outline-title"><i class="fas fa-list-ul"></i><span>目录</span></div>';
    html += '<ul class="outline-list">';
    headings.forEach(function (heading, index) {
      var level = parseInt(heading.tagName.substring(1));
      var text = heading.textContent.trim();
      html += '<li><a class="outline-link" data-level="' + level + '" data-index="' + index + '" href="#' + heading.id + '" title="' + escapeHtml(text) + '">' + escapeHtml(text) + '</a></li>';
    });
    html += '</ul>';

    sidebar.innerHTML = html;
    document.body.appendChild(sidebar);

    outlineLinks = Array.from(sidebar.querySelectorAll('.outline-link'));

    // 延迟显示，避免页面加载闪烁
    setTimeout(function () {
      sidebar.classList.remove('outline-hidden');
    }, 500);
  }

  /**
   * 构建移动端悬浮按钮和抽屉
   */
  function buildMobileDrawer() {
    // 悬浮按钮
    fab = document.createElement('button');
    fab.className = 'outline-fab';
    fab.setAttribute('aria-label', '打开目录');
    fab.innerHTML = '<i class="fas fa-list-ul"></i>';
    fab.addEventListener('click', openDrawer);
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

    var html = '<div class="outline-drawer-header">';
    html += '<div class="outline-title"><i class="fas fa-list-ul"></i><span>目录</span></div>';
    html += '<button class="outline-drawer-close" aria-label="关闭目录"><i class="fas fa-times"></i></button>';
    html += '</div>';
    html += '<ul class="outline-list">';
    headings.forEach(function (heading, index) {
      var level = parseInt(heading.tagName.substring(1));
      var text = heading.textContent.trim();
      html += '<li><a class="outline-link" data-level="' + level + '" data-index="' + index + '" href="#' + heading.id + '" title="' + escapeHtml(text) + '">' + escapeHtml(text) + '</a></li>';
    });
    html += '</ul>';

    drawer.innerHTML = html;
    drawer.querySelector('.outline-drawer-close').addEventListener('click', closeDrawer);
    document.body.appendChild(drawer);
  }

  /**
   * 打开移动端抽屉
   */
  function openDrawer() {
    drawer.classList.add('outline-drawer-open');
    overlay.classList.add('outline-overlay-show');
    document.body.style.overflow = 'hidden';
  }

  /**
   * 关闭移动端抽屉
   */
  function closeDrawer() {
    drawer.classList.remove('outline-drawer-open');
    overlay.classList.remove('outline-overlay-show');
    document.body.style.overflow = '';
  }

  /**
   * 设置平滑滚动（点击大纲项）
   */
  function setupSmoothScroll() {
    // 处理侧边栏和抽屉中的所有大纲链接
    var allLinks = document.querySelectorAll('.outline-link');
    allLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var index = parseInt(link.getAttribute('data-index'));
        var target = headings[index];
        if (!target) return;

        var rect = target.getBoundingClientRect();
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var targetTop = rect.top + scrollTop - config.scrollOffset;

        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });

        // 移动端：点击后关闭抽屉
        if (window.innerWidth <= config.desktopBreakpoint) {
          closeDrawer();
        }
      });
    });
  }

  /**
   * 滚动监听：高亮当前视口内章节对应的大纲项
   * 使用 scroll 事件 + getBoundingClientRect 判断
   */
  var scrollTimer = null;
  function setupScrollSpy() {
    window.addEventListener('scroll', function () {
      if (scrollTimer) cancelAnimationFrame(scrollTimer);
      scrollTimer = requestAnimationFrame(updateActiveOutline);
    });
    updateActiveOutline();
  }

  /**
   * 更新激活的大纲项
   */
  function updateActiveOutline() {
    var activeIndex = -1;
    var scrollPos = window.pageYOffset || document.documentElement.scrollTop;

    // 找到当前视口中第一个标题
    for (var i = 0; i < headings.length; i++) {
      var rect = headings[i].getBoundingClientRect();
      var top = rect.top + window.pageYOffset - config.scrollOffset;

      if (scrollPos >= top - 10) {
        activeIndex = i;
      } else {
        break;
      }
    }

    // 如果在文章顶部，激活第一项
    if (activeIndex === -1 && scrollPos < headings[0].offsetTop) {
      activeIndex = 0;
    }

    if (activeIndex === -1) return;

    // 更新所有链接的激活状态
    var allLinks = document.querySelectorAll('.outline-link');
    allLinks.forEach(function (link, idx) {
      var linkIndex = parseInt(link.getAttribute('data-index'));
      if (linkIndex === activeIndex) {
        link.classList.add('outline-active');
        // 桌面端：将激活项滚动到侧边栏可视区域
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

  /**
   * HTML 转义
   */
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
