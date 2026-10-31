const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
const supabaseUrl = isLocal ? 'https://jjsjpqrgdclczhujkgpc.supabase.co' : window.location.origin + '/supabase';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqc2pwcXJnZGNsY3podWprZ3BjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNzMxMDMsImV4cCI6MjEwODY0OTEwM30.xvF8oOQOGk4mu3_WlYGEEZxKKs-aLyiunugF6xuJRQw';
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault(); 
  
  const name = document.getElementById('name').value;
  const major = document.getElementById('major').value;
  const department = document.getElementById('department').value;
  const contact = document.getElementById('contact').value;
  
  // 获取简历文件
  const fileInput = document.getElementById('resumeFile');
  let fileUrl = ''; 
  const file = fileInput ? fileInput.files[0] : null;

  // 1. 如果用户选了简历文件，先上传到 Supabase Storage
  if (file) {
    // 限制文件大小 10MB
    if (file.size > 10 * 1024 * 1024) { alert("文件太大了，请控制在10MB以内！"); return; }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `resume_${Date.now()}.${fileExt}`;
    
    // 上传到图床桶
    const { data, error } = await supabaseClient.storage.from('images').upload(fileName, file);
    if (error) { alert("文件上传失败：" + error.message); return; }
    
    // 获取公开可访问的链接
    const { data: urlData } = supabaseClient.storage.from('images').getPublicUrl(fileName);
    fileUrl = urlData.publicUrl;
  }

  // 2. 将文字和文件链接一起存入数据库 registrations 表
  const { error } = await supabaseClient
    .from('registrations')
    .insert([{ 
        name: name, 
        major: major, 
        department: department, 
        contact: contact, 
        resume_url: fileUrl // ⚠️ 注意：这里存的是文件链接
    }]);

  if (error) {
    console.error(error);
    alert('报名失败，请检查网络或控制台！');
  } else {
    alert('报名成功！欢迎加入逐浪智用社！');
    document.getElementById('registerForm').reset(); // 清空表单
  }
});
  // ==========================================
// 动态加载最新动态（推文）
// ==========================================
async function loadNews() {
    const container = document.getElementById('news-list');
    if (!container) return;

    // 去 Supabase 的 news 表里把数据全拿出来
    const { data, error } = await supabaseClient
    .from('news')
    .select('*')
    .order('id', { ascending: false })
    .limit(3);

    if (error) {
        console.error("加载推文失败：", error);
        container.innerHTML = `<p style="color: red;">加载动态失败，请检查网络或控制台。</p >`;
        return;
    }

    // 如果数据库里一条都没有，给个提示
    if (data.length === 0) {
        container.innerHTML = `<p style="color: #a1a1aa;">暂时没有最新动态哦~</p >`;
        return;
    }

    // 清空原本的内容
    container.innerHTML = '';

    // 把数据库里的每一行数据，变成一张卡片
    data.forEach(item => {
        const card = `
            <div class="project-card" style="background: rgba(20, 30, 50, 0.7); backdrop-filter: blur(12px); border-left: 4px solid #00ffff; padding: 25px 30px; border-radius: 0 10px 10px 0; text-align: left; transition: transform 0.3s;" onmouseover="this.style.transform='translateX(10px)'" onmouseout="this.style.transform='translateX(0)'">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="color: #00ffff; margin: 0; font-size: 20px;">🚀 ${item.title}</h3>
                <span style="color: #a1a1aa; font-size: 14px; background: rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 5px;">${item.date_str || '最新'}</span>
              </div>
              <p style="color: #d4d4d4; line-height: 1.8; margin: 0;">
  ${item.content.replace(/<[^>]+>/g, '').substring(0, 60)}...
</p >
            </div>
        `;
        container.innerHTML += card;
    });
}

// 页面一加载，立刻执行这个函数去拉数据
loadNews();