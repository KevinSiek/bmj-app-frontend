function getBase64FromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg');
      resolve(dataURL);
    };
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

export {
  getBase64FromUrl
}
