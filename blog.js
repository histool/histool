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
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

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
    const linkHtml = post.link_url ? `<div style="margin-top:20px;"><a href="${post.link_url}" target="_blank" style="font-size:14px; color:#fff; text-decoration:none; border-bottom:1px solid #555;">查看项目 ↗</a></div>` : '';

    return `
        <article class="post-card">
            <div class="post-date">${dateStr}</div>
            <h3 class="post-title">${post.title}</h3>
            <div class="post-content">
                ${post.content.replace(/\n/g, '<br>')}
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
    } else {
        loginForm.style.display = 'block';
        postForm.style.display = 'none';
        resetForm.style.display = 'none';
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

// 发布帖子
async function handlePostSubmit() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const link_url = document.getElementById('post-link').value;
    const image_url = document.getElementById('post-image').value;

    if (!title || !content) {
        alert('请填写标题和内容');
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('posts')
            .insert([{ title, content, link_url, image_url }]);

        if (error) throw error;

        // 重置表单并刷新
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('post-link').value = '';
        document.getElementById('post-image').value = '';

        await fetchPosts();
        closeAdminModal();
    } catch (err) {
        alert('发布失败: ' + err.message);
    }
}

// 全局暴露给 HTML
// 切换密码更新表单显示
function togglePasswordUpdate(show) {
    const postForm = document.getElementById('post-form-container');
    const resetForm = document.getElementById('reset-password-container');

    if (show) {
        postForm.style.display = 'none';
        resetForm.style.display = 'block';
    } else {
        postForm.style.display = 'block';
        resetForm.style.display = 'none';
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
