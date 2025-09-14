// 通用导航JavaScript
jQuery(document).ready(function($) {
    // 检测设备方向
    if($(window).height() > $(window).width()){
        var portrait = true;
    } else {
        var portrait = false;
    }

    // 滚动事件处理
    let hasScrolled = false;
    
    $(window).scroll(function() {
        if (!hasScrolled) {
            hasScrolled = true;
            // 当开始滚动时，隐藏导航栏
            $('nav.main').addClass('hidden');
            $('nav.right').addClass('hidden');
        }
    });
    
    // 点击触发区域展开导航栏
    $('.nav-trigger-left').click(function() {
        if (hasScrolled) {
            $('nav.main').removeClass('hidden');
        }
    });
    
    $('.nav-trigger-right').click(function() {
        if (hasScrolled) {
            $('nav.right').removeClass('hidden');
        }
    });
    
    // 触发区域悬停展开导航栏
    $('.nav-trigger-left').hover(
        function() {
            if (hasScrolled) {
                $('nav.main').removeClass('hidden');
            }
        },
        function() {
            if (hasScrolled) {
                $('nav.main').addClass('hidden');
            }
        }
    );
    
    $('.nav-trigger-right').hover(
        function() {
            if (hasScrolled) {
                $('nav.right').removeClass('hidden');
            }
        },
        function() {
            if (hasScrolled) {
                $('nav.right').addClass('hidden');
            }
        }
    );
    
    // 点击屏幕边缘展开导航栏
    $(document).click(function(e) {
        // 如果导航栏已隐藏且点击在屏幕边缘
        if (hasScrolled && $('nav.main').hasClass('hidden')) {
            // 点击左侧边缘（屏幕左1/6区域）
            if (e.pageX < $(window).width() / 6) {
                $('nav.main').removeClass('hidden');
            }
            // 点击右侧边缘（屏幕右1/6区域）
            if (e.pageX > $(window).width() * 5 / 6) {
                $('nav.right').removeClass('hidden');
            }
        }
    });
    
    // 全局鼠标移动检测，离开导航区域时收缩
    $(document).mousemove(function(e) {
        if (hasScrolled) {
            const windowWidth = $(window).width();
            const navWidth = windowWidth * 0.1666; // 16.666%
            
            // 检查鼠标是否在导航栏区域内
            const inLeftNav = e.pageX < navWidth;
            const inRightNav = e.pageX > windowWidth - navWidth;
            const inLeftTrigger = e.pageX < 20;
            const inRightTrigger = e.pageX > windowWidth - 20;
            
            // 如果鼠标不在任何导航区域内，收缩导航栏
            if (!inLeftNav && !inRightNav && !inLeftTrigger && !inRightTrigger) {
                $('nav.main').addClass('hidden');
                $('nav.right').addClass('hidden');
            }
        }
    });
    
    // 鼠标悬停展开导航栏
    $('nav.main').hover(
        function() {
            if (hasScrolled) {
                $(this).removeClass('hidden');
            }
        },
        function() {
            if (hasScrolled) {
                $(this).addClass('hidden');
            }
        }
    );
    
    $('nav.right').hover(
        function() {
            if (hasScrolled) {
                $(this).removeClass('hidden');
            }
        },
        function() {
            if (hasScrolled) {
                $(this).addClass('hidden');
            }
        }
    );

    // 桌面端功能
    if(!portrait){
        $("li.level-0").click(function(event) {
            // 如果是普通链接，正常跳转
            if($(this).hasClass('activeLevel0')){
                $(this).removeClass('activeLevel0');
            } else {
                $('.activeLevel0').removeClass('activeLevel0');
                $(this).addClass('activeLevel0');
            }
        });
    }

    // 移动端功能
    if(portrait){
        $("#hamburgerMobil").click(function(event) {
            $('#hamburgerContent').show();
        });

        $("#hamburgerContent").click(function(event) {
            $('#hamburgerContent').hide();
        });
    }
});
