document.getElementById('theme-toggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    // Optionally, change the icon
    this.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});