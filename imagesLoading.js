const gallery = document.getElementById("gallery");
const totalImages = 88;

for (let i = 1; i <= totalImages; i++) {
  const img = document.createElement("img");
  const num = String(i).padStart(2, "0");
  img.src = `/assets/project_04/namingImages${num}.png`; // 바로 표시
  img.alt = `이미지 ${num}`;
  img.id = `naming${num}`;
  gallery.appendChild(img);
}
