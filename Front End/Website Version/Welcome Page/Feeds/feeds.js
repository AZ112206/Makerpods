document.addEventListener('DOMContentLoaded', () => {
  // --- Vote Button Logic ---
  const voteBtns = document.querySelectorAll('.vote-btn');

  voteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const post = btn.closest('.feed-post');
      const countSpan = post.querySelector('.vote-count');
      const isUp = btn.classList.contains('up');

      // Simple toggle logic for mockup
      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        // In a real app, we'd decrement the count
      } else {
        // Remove active from the other button in the same post
        const siblingBtn = isUp ? post.querySelector('.vote-btn.down') : post.querySelector('.vote-btn.up');
        if (siblingBtn) siblingBtn.classList.remove('active');

        btn.classList.add('active');
      }
    });
  });

  // --- Action Buttons (Comment/Share) ---
  const actionBtns = document.querySelectorAll('.action-btn');
  actionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.textContent.trim();
      alert(`${action} clicked! (This is a mockup)`);
    });
  });

  // --- Feeds Search Logic ---
  const searchInput = document.getElementById('universal-search');
  const posts = document.querySelectorAll('.feed-post');

  if (searchInput && posts.length > 0) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();

      posts.forEach(post => {
        const title = post.querySelector('.feed-title').textContent.toLowerCase();
        const body = post.querySelector('.feed-body').textContent.toLowerCase();
        const username = post.querySelector('.username').textContent.toLowerCase();

        if (title.includes(searchTerm) || body.includes(searchTerm) || username.includes(searchTerm)) {
          post.style.display = 'flex';
        } else {
          post.style.display = 'none';
        }
      });
    });
  }

  // --- Universal Search (Enter key) ---
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value;
        alert(`Universal search for: ${query}\n(In a real app, this would search across Home, Spaces, Feeds, etc.)`);
      }
    });
  }
});
