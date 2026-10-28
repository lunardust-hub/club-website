const supabaseUrl = 'https://jjsjpqrgdclczhujkgpc.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqc2pwcXJnZGNsY3podWprZ3BjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNzMxMDMsImV4cCI6MjEwODY0OTEwM30.xvF8oOQOGk4mu3_WlYGEEZxKKs-aLyiunugF6xuJRQw';
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const name = document.getElementById('name').value;
    const major = document.getElementById('major').value;
    const department = document.getElementById('department').value;

    const { data, error } = await supabaseClient
      .from('registrations')
      .insert([{ name: name, major: major, department: department }]);

    if (error) {
      console.error(error);
      alert('报名失败，请检查控制台！');
    } else {
      alert('报名成功！欢迎加入逐浪智用社！');
      document.getElementById('registerForm').reset(); 
    }
  });