// 艺术家参考左侧导航功能
document.addEventListener('DOMContentLoaded', function () {
    // 获取所有导航项
    const navItems = document.querySelectorAll('.artist-nav-item');

    if (navItems.length > 0) {
        // 为每个导航项添加点击事件
        navItems.forEach(item => {
            item.addEventListener('click', function () {
                // 移除所有导航项的active类
                navItems.forEach(navItem => navItem.classList.remove('active'));
                // 为当前点击的导航项添加active类
                this.classList.add('active');

                // 获取要导航到的分类ID
                const categoryId = this.getAttribute('data-category');
                // 滚动到对应的艺术家分类
                const targetElement = document.getElementById(categoryId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // 监听滚动，高亮当前可见的分类
        window.addEventListener('scroll', function () {
            const artistCategories = document.querySelectorAll('.artist-list');
            let currentCategory = null;

            artistCategories.forEach(category => {
                const rect = category.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom >= 150) {
                    currentCategory = category.id;
                }
            });

            if (currentCategory) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('data-category') === currentCategory) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }
});

// 更新所有导航链接，附带当前状态参数
function updateNavLinks(isEnabled) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript')) {
            try {
                const url = new URL(href, window.location.href);
                // 显式设置参数，无论是true还是false，以确保覆盖目标页面的localStorage
                url.searchParams.set('paid', isEnabled ? 'true' : 'false');

                // 保持相对路径，避免变成绝对路径
                const newHref = href.split('?')[0] + (url.search ? '?' + url.searchParams.toString() : '');
                link.setAttribute('href', newHref);
            } catch (e) {
                console.error('Error updating link:', href, e);
            }
        }
    });
}

// 付费内容开关功能（同时控制付费课程和祂的研究）
window.togglePaidCourses = function (element) {
    const isActive = element.classList.toggle('active');
    const paidCoursesLink = document.getElementById('paid-courses-link');
    const brainResearchLink = document.getElementById('brain-research-link');

    // 更新UI状态
    if (isActive) {
        if (paidCoursesLink) {
            paidCoursesLink.style.display = 'block';
            setTimeout(() => paidCoursesLink.style.opacity = '1', 10);
        }
        if (brainResearchLink) {
            brainResearchLink.style.display = 'block';
            setTimeout(() => brainResearchLink.style.opacity = '1', 10);
        }
    } else {
        if (paidCoursesLink) {
            paidCoursesLink.style.opacity = '0';
            setTimeout(() => paidCoursesLink.style.display = 'none', 300);
        }
        if (brainResearchLink) {
            brainResearchLink.style.opacity = '0';
            setTimeout(() => brainResearchLink.style.display = 'none', 300);
        }
    }

    // 更新当前URL（不刷新页面）
    const currentUrl = new URL(window.location.href);
    // 显式设置参数
    currentUrl.searchParams.set('paid', isActive ? 'true' : 'false');
    window.history.replaceState({}, '', currentUrl);

    // 更新页面上所有链接
    updateNavLinks(isActive);

    // 仍然保存到localStorage作为备份
    localStorage.setItem('paidCoursesEnabled', isActive);
}

// 页面加载时初始化
function initPaidCoursesToggle() {
    const toggleSwitch = document.getElementById('paid-courses-toggle');
    const paidCoursesLink = document.getElementById('paid-courses-link');
    const brainResearchLink = document.getElementById('brain-research-link');

    if (toggleSwitch) {
        const toggleCircle = toggleSwitch.querySelector('.toggle-circle');

        // 优先从URL参数读取状态
        const urlParams = new URLSearchParams(window.location.search);

        // 默认状态逻辑：
        // 1. 如果是付费页面，强制为true
        // 2. 如果URL有paid参数，直接使用该参数值 (true/false)
        // 3. 如果URL无参数且非付费页面，读取localStorage

        let isEnabled = false;
        const currentPath = window.location.pathname;
        const isPaidPage = currentPath.includes('paid-courses.html') || currentPath.includes('brain-research.html');

        if (isPaidPage) {
            isEnabled = true;
            // 强制更新URL为true，即使用户之前传了false进来
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('paid', 'true');
            window.history.replaceState({}, '', currentUrl);
        } else if (urlParams.has('paid')) {
            isEnabled = urlParams.get('paid') === 'true';
        } else {
            // 如果URL没参数且不在付费页，尝试读取localStorage
            isEnabled = localStorage.getItem('paidCoursesEnabled') === 'true';
        }

        // 确保没有过渡动画
        if (paidCoursesLink) paidCoursesLink.style.transition = 'none';
        if (brainResearchLink) brainResearchLink.style.transition = 'none';
        if (toggleCircle) toggleCircle.style.transition = 'none';

        // 设置初始状态
        if (isEnabled) {
            toggleSwitch.classList.add('active');
            if (paidCoursesLink) {
                paidCoursesLink.style.display = 'block';
                paidCoursesLink.style.opacity = '1';
            }
            if (brainResearchLink) {
                brainResearchLink.style.display = 'block';
                brainResearchLink.style.opacity = '1';
            }
        } else {
            toggleSwitch.classList.remove('active');
            if (paidCoursesLink) {
                paidCoursesLink.style.display = 'none';
                paidCoursesLink.style.opacity = '0';
            }
            if (brainResearchLink) {
                brainResearchLink.style.display = 'none';
                brainResearchLink.style.opacity = '0';
            }
        }

        // 更新所有链接以包含当前状态
        updateNavLinks(isEnabled);

        // 延迟恢复过渡动画
        setTimeout(() => {
            if (paidCoursesLink) paidCoursesLink.style.transition = 'opacity 0.3s ease';
            if (brainResearchLink) brainResearchLink.style.transition = 'opacity 0.3s ease';
            if (toggleCircle) toggleCircle.style.transition = 'transform 0.3s ease';
        }, 100);
    }

    // 显示页面内容
    document.body.classList.add('loaded');
}

document.addEventListener('DOMContentLoaded', initPaidCoursesToggle);

// 课程切换功能
document.addEventListener('DOMContentLoaded', function () {
    const courseOptions = document.querySelectorAll('.course-option');
    const contentSections = document.querySelectorAll('.course-content-section');

    if (courseOptions.length > 0) {
        courseOptions.forEach(option => {
            option.addEventListener('click', function () {
                const courseType = this.getAttribute('data-course');
                const researchType = this.getAttribute('data-research');

                // 如果是AI写作1期，需要密码验证
                if (courseType === 'ai-writing-1') {
                    showPasswordModal('ai-writing');
                    return;
                }

                // 移除所有active类
                courseOptions.forEach(opt => opt.classList.remove('active'));
                contentSections.forEach(section => section.classList.remove('active'));

                // 添加active类到当前选项
                this.classList.add('active');

                // 显示对应内容
                let targetSection;
                if (courseType) {
                    targetSection = document.getElementById(courseType + '-content');
                } else if (researchType) {
                    targetSection = document.getElementById(researchType + '-content');
                }

                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        });
    }
});

// 密码相关功能
window.showPasswordModal = function (type = 'ai-writing') {
    const modal = document.getElementById('passwordModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.dataset.type = type; // 存储当前验证类型
        const input = document.getElementById('passwordInput');
        if (input) input.focus();
        const error = document.getElementById('passwordError');
        if (error) error.style.display = 'none';
    }
}

window.closePasswordModal = function () {
    const modal = document.getElementById('passwordModal');
    if (modal) {
        modal.style.display = 'none';
        const input = document.getElementById('passwordInput');
        if (input) input.value = '';
        const error = document.getElementById('passwordError');
        if (error) error.style.display = 'none';
    }
}

window.checkPassword = function () {
    const input = document.getElementById('passwordInput');
    if (!input) return;

    const password = input.value;
    const modal = document.getElementById('passwordModal');
    const type = modal.dataset.type || 'ai-writing';

    console.log('Password check:', password, 'Type:', type); // 调试信息

    // 根据验证类型使用不同的密码
    if (type === 'research') {
        // 脑机研究的密码
        if (password === 'profyu') {
            closePasswordModal();
            // 显示完整研究内容
            const fullContent = document.getElementById('full-research-content');
            if (fullContent) {
                fullContent.style.display = 'block';
                // 隐藏查看按钮
                const viewBtn = document.getElementById('view-brain-research');
                if (viewBtn) viewBtn.style.display = 'none';
            } else {
                // 如果没有找到内容div，尝试跳转（兼容旧逻辑）
                window.location.href = 'brain-research.html';
            }
        } else {
            const error = document.getElementById('passwordError');
            if (error) error.style.display = 'block';
            input.value = '';
        }
    } else {
        // AI写作课程的密码
        const correctPassword = '20250921';
        if (password === correctPassword) {
            closePasswordModal();
            // 跳转到AI写作课程页面
            console.log('Password correct, redirecting...'); // 调试信息
            setTimeout(() => {
                window.location.href = 'ai-writing-course.html';
            }, 100);
        } else {
            const error = document.getElementById('passwordError');
            if (error) error.style.display = 'block';
            input.value = '';
        }
    }
}

// 监听回车键和按钮事件
document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }

    // 查看研究方案按钮点击事件
    const viewResearchBtn = document.getElementById('view-brain-research');
    if (viewResearchBtn) {
        viewResearchBtn.addEventListener('click', function () {
            showPasswordModal('research');
        });
    }
});
