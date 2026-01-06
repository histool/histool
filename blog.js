const SUPABASE_URL = 'https://cjdrihggelrzpdieniod.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_F4xpveFXlFgc3gNOtf5oQw_ASRO-_CG';

// 使用全局 supabase 对象创建客户端
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async () => {
    await fetchPosts();
    checkAuthStatus();
    handlePasswordResetDetection();
});

// 处理密码重置检测
function handlePasswordResetDetection() {
    // Supabase 会在重置链接中包含 access_token 等信息
    if (window.location.hash && window.location.hash.includes('type=recovery')) {
        openAdminModal();
    }
}

// 获取并渲染帖子
async function fetchPosts() {
    const container = document.getElementById('blog-posts');
    const loading = document.getElementById('loading-indicator');

    try {
        const { data, error } = await supabaseClient
            .from('news_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // 移除调试日志
        // if (data && data.length > 0) {
        //     console.log('Detected Schema from first row:', Object.keys(data[0]));
        // }

        if (loading) loading.style.display = 'none';

        if (data.length === 0) {
            container.innerHTML = '<div style="text-align:center; color:#555; padding:40px;">还没有记录，点右下角添加一个吧 ：）</div>';
            return;
        }

        container.innerHTML = data.map(post => renderPost(post)).join('');
    } catch (err) {
        console.error('Error fetching posts:', err);
        container.innerHTML = `<div style="text-align:center; color:#ff4d4d; padding:40px;">加载失败: ${err.message}</div>`;
    }
}

function renderPost(post) {
    const dateStr = post.date_str || new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    }).toUpperCase().replace(/ /g, '-').replace(',', '');

    const imageHtml = post.image_url ? `<img src="${post.image_url}" class="post-image" alt="${post.title}">` : '';
    // 使用数据库中的 'url' 字段
    const targetUrl = post.url || post.link_url;
    const linkHtml = targetUrl ? `<div style="margin-top:20px;"><a href="${targetUrl}" target="_blank" style="font-size:14px; color:#fff; text-decoration:none; border-bottom:1px solid #555;">查看项目 ↗</a></div>` : '';

    const contentText = post.note || post.content || '';

    return `
        <article class="post-card" id="post-${post.id}">
            <div class="post-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div class="post-date">${dateStr}</div>
                <button class="delete-post-btn" onclick="handleDeletePost('${post.id}')" style="display: none;">删除</button>
            </div>
            <h3 class="post-title">${post.title}</h3>
            <div class="post-content">
                ${contentText.replace(/\n/g, '<br>')}
            </div>
            ${imageHtml}
            ${linkHtml}
        </article>
    `;
}

// 弹窗管理
function openAdminModal() {
    document.getElementById('admin-modal').style.display = 'flex';
}

function closeAdminModal() {
    document.getElementById('admin-modal').style.display = 'none';
}

function closeAdminModalByBackground(e) {
    if (e.target.id === 'admin-modal') {
        closeAdminModal();
    }
}

// 处理图片选择
function handleImageSelect(e) {
    // 兼容点击选择 (e.target.files) 和 拖拽选择 (e.dataTransfer.files)
    const file = (e.target.files && e.target.files[0]) || (e.dataTransfer && e.dataTransfer.files[0]);
    if (!file) return;

    selectedFile = file;
    const previewUrl = URL.createObjectURL(file);
    const previewContainer = document.getElementById('image-preview-container');
    const dropZoneContent = document.getElementById('drop-zone-content');

    previewContainer.innerHTML = `<img src="${previewUrl}" alt="Preview" style="width:100%; height:100%; object-fit:cover;">`;
    previewContainer.style.display = 'block';
    dropZoneContent.style.display = 'none';
    document.getElementById('clear-preview-btn').style.display = 'block';
}

function clearImagePreview() {
    selectedFile = null;
    const previewContainer = document.getElementById('image-preview-container');
    const dropZoneContent = document.getElementById('drop-zone-content');

    previewContainer.innerHTML = '';
    previewContainer.style.display = 'none';
    dropZoneContent.style.display = 'flex';
    document.getElementById('clear-preview-btn').style.display = 'none';

    const imageInput = document.getElementById('image-input');
    if (imageInput) imageInput.value = '';
}

// 绑定拖拽事件
function setupDragAndDrop() {
    const dropZone = document.getElementById('image-drop-zone');
    if (!dropZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    dropZone.addEventListener('drop', handleImageSelect, false);
}

// 身份验证
async function handleAdminLogin() {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const errorMsg = document.getElementById('login-error');

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;

        checkAuthStatus();
        errorMsg.style.display = 'none';
    } catch (err) {
        errorMsg.innerText = '登录失败: ' + err.message;
        errorMsg.style.display = 'block';
    }
}

async function handleLogout() {
    await supabaseClient.auth.signOut();
    checkAuthStatus();
    closeAdminModal();
}

async function checkAuthStatus() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const loginForm = document.getElementById('login-form-container');
    const postForm = document.getElementById('post-form-container');
    const resetForm = document.getElementById('reset-password-container');

    // 优先检查是否是密码重置流程
    if (window.location.hash && window.location.hash.includes('type=recovery')) {
        loginForm.style.display = 'none';
        postForm.style.display = 'none';
        resetForm.style.display = 'block';
        return;
    }

    if (user) {
        loginForm.style.display = 'none';
        postForm.style.display = 'block';
        resetForm.style.display = 'none';
        isAdminNow = true;
        toggleDeleteButtons(isAdminNow);
    } else {
        loginForm.style.display = 'block';
        postForm.style.display = 'none';
        resetForm.style.display = 'none';
        isAdminNow = false;
        isManageMode = false;
        toggleDeleteButtons(false);
    }
}

let isAdminNow = false;
let isManageMode = false;
let selectedFile = null; // 存储待上传的 File 对象

function toggleDeleteButtons(show) {
    const btns = document.querySelectorAll('.delete-post-btn');
    btns.forEach(btn => {
        // 只有在管理员登录且开启管理模式时才显示删除按钮
        btn.style.display = (show && isManageMode) ? 'inline-block' : 'none';
    });
}

function showAdminSection(section) {
    const sectionAdd = document.getElementById('section-add');
    const sectionManage = document.getElementById('section-manage');
    const navAdd = document.getElementById('nav-add-btn');
    const navManage = document.getElementById('nav-manage-btn');

    if (section === 'add') {
        sectionAdd.style.display = 'block';
        sectionManage.style.display = 'none';
        navAdd.classList.add('active');
        navManage.classList.remove('active');
    } else {
        sectionAdd.style.display = 'none';
        sectionManage.style.display = 'block';
        navAdd.classList.remove('active');
        navManage.classList.add('active');
    }
}

function toggleAdminManageMode() {
    isManageMode = !isManageMode;
    const btn = document.getElementById('toggle-manage-mode-btn');
    if (isManageMode) {
        btn.textContent = '关闭删除权限';
        btn.style.background = '#ff4d4d';
    } else {
        btn.textContent = '开启删除权限';
        btn.style.background = '#333';
    }
    toggleDeleteButtons(isAdminNow);
}

// 删除功能
async function handleDeletePost(postId) {
    console.log('Attempting to delete post with ID:', postId);
    if (!confirm('确定要从云端归档中永久删除这条记录吗？')) return;

    try {
        // 使用 .delete().select() 来确认是否有行被真正删除了
        const { data, error, status } = await supabaseClient
            .from('news_items')
            .delete()
            .eq('id', postId)
            .select();

        if (error) {
            console.error('Supabase Delete Error:', error);
            throw error;
        }

        // 如果 data 为空，说明虽然没有报错，但由于 RLS 策略，数据库拒绝了删除操作或未找到 ID
        if (!data || data.length === 0) {
            console.warn('Delete operation returned no data. Check RLS policies.');
            alert('❌ 删除失败（无权限）\n\n看起来云端数据库拒绝了您的删除请求。\n\n解决办法：\n1. 登录 Supabase 后台。\n2. 进入 Database > Policies。\n3. 找到 posts 表，为 authenticated 角色添加 DELETE 权限。');
            return;
        }

        console.log('Post deleted successfully from Supabase:', data);

        // 成功提示
        const btn = document.querySelector(`#post-${postId} .delete-post-btn`);
        if (btn) {
            btn.textContent = '已在云端删除 ✓';
            btn.style.color = '#4cd964';
        }

        // 从 DOM 中移除
        setTimeout(async () => {
            const postElement = document.getElementById(`post-${postId}`);
            if (postElement) {
                postElement.style.opacity = '0';
                postElement.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    postElement.remove();
                    // 重新抓取以确保本地视图与云端完全同步
                    fetchPosts();
                }, 300);
            }
        }, 1000);
    } catch (err) {
        console.error('Catch error in handleDeletePost:', err);
        let errorMsg = '❌ 云端同步失败: ' + err.message;

        if (err.message.includes('permission denied') || err.code === '42501') {
            errorMsg = '❌ 权限不足 (Permission Denied)\n\n您的 Supabase 账号虽然已登录，但数据库尚未配置允许删除的策略 (RLS Policy)。\n\n请联系技术支持或在后台开启 DELETE 权限。';
        }

        alert(errorMsg);
    }
}

// 忘记密码 - 发送重置邮件
async function handleForgotPassword() {
    const email = document.getElementById('admin-email').value;
    if (!email) {
        alert('请输入邮箱以重置密码');
        return;
    }

    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.href, // 重置后跳回当前页面
        });
        if (error) throw error;
        alert('重置邮件已发送，请检查收件箱');
    } catch (err) {
        alert('发送失败: ' + err.message);
    }
}

// 更新密码
async function handlePasswordUpdate() {
    const newPassword = document.getElementById('new-password').value;
    if (!newPassword || newPassword.length < 6) {
        alert('密码长度至少为 6 位');
        return;
    }

    try {
        const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
        if (error) throw error;
        alert('密码已成功更新！');

        // 清除 hash 并刷新状态
        window.location.hash = '';
        checkAuthStatus();
    } catch (err) {
        alert('更新失败: ' + err.message);
    }
}

async function uploadFileToSupabase(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `news/${fileName}`;

    const { data, error } = await supabaseClient.storage
        .from('news-images')
        .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabaseClient.storage
        .from('news-images')
        .getPublicUrl(filePath);

    return publicUrl;
}

// 发布帖子
async function handlePostSubmit() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const date_str = document.getElementById('post-date-str') ? document.getElementById('post-date-str').value : '';
    const link_url = document.getElementById('post-link').value;
    const submitBtn = document.getElementById('post-submit-btn');

    if (!title || !content) {
        alert('请填写标题和内容');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '正在上传云端...';

    try {
        let imageUrl = null;
        if (selectedFile) {
            imageUrl = await uploadFileToSupabase(selectedFile);
        }

        // 映射到数据库实际列名
        const postData = {
            title: title,
            note: content,
            url: link_url,
            image_url: imageUrl // 写入云端存储 URL
        };

        const { error } = await supabaseClient
            .from('news_items')
            .insert([postData]);

        if (error) throw error;

        // 重置表单并刷新
        document.getElementById('post-title').value = '';
        if (document.getElementById('post-date-str')) document.getElementById('post-date-str').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('post-link').value = '';
        clearImagePreview();

        await fetchPosts();
        closeAdminModal();
        alert('发布成功！');
    } catch (err) {
        console.error('Core Post Error:', err);
        alert('发布失败: ' + err.message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '提交到归档';
        }
    }
}

// 全局暴露给 HTML
// 切换密码更新表单显示
function togglePasswordUpdate(show) {
    const loginForm = document.getElementById('login-form-container');
    const postForm = document.getElementById('post-form-container');
    const resetForm = document.getElementById('reset-password-container');

    if (show) {
        loginForm.style.display = 'none';
        postForm.style.display = 'none';
        resetForm.style.display = 'block';
    } else {
        resetForm.style.display = 'none';
        // 根据当前的登录状态决定返回哪里
        checkAuthStatus();
    }
}

window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.handleAdminLogin = handleAdminLogin;
window.handlePostSubmit = handlePostSubmit;
window.handleLogout = handleLogout;
window.handleForgotPassword = handleForgotPassword;
window.handlePasswordUpdate = handlePasswordUpdate;
window.togglePasswordUpdate = togglePasswordUpdate;
window.handleDeletePost = handleDeletePost;
window.showAdminSection = showAdminSection;
window.toggleAdminManageMode = toggleAdminManageMode;
window.closeAdminModalByBackground = closeAdminModalByBackground;
window.handleImageSelect = handleImageSelect;
window.clearImagePreview = clearImagePreview;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();
    checkAuthStatus();
    setupDragAndDrop();
});
