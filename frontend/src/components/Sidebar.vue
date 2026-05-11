<template>
  <aside class="sidebar">
    <div class="logo">
      <div class="logo-icon">💊</div>
      <div>
        <strong>Supplement</strong>
        <span>Trends</span>
      </div>
    </div>

    <nav class="nav">
      <RouterLink to="/dashboard" class="nav-link">
        <span>📈</span>
        Dashboard
      </RouterLink>

      <RouterLink to="/chat" class="nav-link">
        <span>💬</span>
        Chat
      </RouterLink>

      <RouterLink to="/plan" class="nav-link">
        <span>📋</span>
        Mein Plan
      </RouterLink>

    </nav>

  </aside>
</template>