import React, { useState } from 'react';

const ImageUploadPreview = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0]; // Get the first file
    if (file) {
      // Generate a URL for the image file
      const imageURL = URL.createObjectURL(file);
      setSelectedImage(imageURL); // Set the URL to state
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      
      {selectedImage && (
        <div>
          <h4>Image Preview:</h4>
          <img src={selectedImage} alt="Selected" style={{ width: '300px', height: '300px' }} />
        </div>
      )}
    </div>
  );
};

export default ImageUploadPreview;