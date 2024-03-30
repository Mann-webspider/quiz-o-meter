import React, { useState, useEffect } from 'react';
// import './AvatarContainer.css'; // Your CSS file to style the avatars
import Avatar,{genConfig} from 'react-nice-avatar'

const AvatarContainer = ({ users }) => {
  // We will use a ref to measure the container's width and height.
  const containerRef = useState(null);

  const positionAvatars = () => {
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // Get an array of already positioned avatars
    const positioned = Array.from(container.children);

    positioned.forEach((avatar, i) => {
      let x, y;
      if (i === 0) {
        // If it's the first avatar, place it randomly within the container
        x = Math.random() * (containerWidth - avatar.offsetWidth);
        y = Math.random() * (containerHeight/2 - avatar.offsetHeight);
    } else {
          x = Math.random() * (containerWidth - avatar.offsetWidth);
          y = Math.random() * (containerHeight/2 - avatar.offsetHeight);
        // Get the previous avatar's position
        // const prevAvatarRect = positioned[i - 1].getBoundingClientRect();
        
        // Calculate new position near the previous avatar without overlapping
        
        // x = prevAvatarRect.right + Math.random() * 10; // 10 pixels gap from the previous avatar; adjust as needed
        // y = prevAvatarRect.top + Math.random() * 100;

        // If new position goes beyond the container, reset to near the top with a random x value
        // if (x + avatar.offsetWidth > containerWidth) {
        //   x = Math.random() * (containerWidth - avatar.offsetWidth);
        //   y = 10; // Start 10 pixels from the top; adjust as needed
        // }
        
        // if (y + avatar.offsetHeight > containerHeight) {
        //   y = Math.random() * (containerHeight - avatar.offsetHeight);
        // }
      }
      
      // Apply positions
      avatar.style.position = 'absolute';
      avatar.style.left = `${x}px`;
      avatar.style.top = `${y}px`;
    });
  };

  // Re-calculate positions when users change
  useEffect(() => {
    positionAvatars();
  }, [users]);
// positionAvatars()
  return (
    <div ref={containerRef} className="avatar-container h-full w-full overflow-hidden">
      {users.map((user, index) => (
        
        <Avatar style={{width:`5rem`,height:`5rem`}} key={index} {...genConfig(user)}/>
      ))}
    </div>
  );
};

export default AvatarContainer;