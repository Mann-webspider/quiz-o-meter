function positionAvatars() {
    const avatars = document.getElementsByClassName('user-avatar');
    const container = document.getElementById('avatar-container');
    
    // Container center
    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;
    
    // Radius of the circle on which avatars will be placed
    const radius = Math.min(centerX, centerY) - 50; // 50 is to ensure avatars don't touch the edge
    
    // Angle between each avatar
    const angleStep = (2 * Math.PI) / avatars.length;
    
    for (let i = 0; i < avatars.length; i++) {
      // Position for each avatar based on the circle equation
      const x = centerX + radius * Math.cos(i * angleStep) - avatars[i].offsetWidth / 2;
      const y = centerY + radius * Math.sin(i * angleStep) - avatars[i].offsetHeight / 2;
      
      // Apply positions
      avatars[i].style.position = 'absolute';
      avatars[i].style.left = ${x}px;
      avatars[i].style.top = ${y}px;
    }
  }
  
  // Call this function every time an avatar is added
  positionAvatars();






  // Function to add an avatar
function addAvatar(userList) {
    const avatarContainer = document.getElementById('avatar-container');
    const newUserAvatar = document.createElement('div');
    newUserAvatar.classList.add('user-avatar');
    newUserAvatar.style.backgroundImage = url(${user.avatarUrl});
    avatarContainer.appendChild(newUserAvatar);
    // After adding, call a function to reposition avatars if necessary
    positionAvatars();
}


// Example usage
// addAvatar({ avatarUrl: 'path-to-image.jpg' });