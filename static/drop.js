class DropField {
  constructor() {
    this.element = document.getElementById('drop');
    this.listElement = document.getElementById('files');
    this.loadFiles = this.loadFiles.bind(this);

    document.ondragover = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.element.innerText = 'HERE';
    };

    document.ondragleave = (e) => { e.preventDefault(); this.element.innerText = 'DROP FILES'; };
    document.ondrop = (e) => { e.preventDefault(); this.element.innerText = 'DROP FILES'; };

    this.element.ondrop = (e) => {
      e.preventDefault();
      e.stopPropagation();

      this.sendFiles(e.dataTransfer.files);
      this.element.innerText = 'DROP FILES';
    };

    this.element.ondragover = (e) => { e.stopPropagation(); e.preventDefault(); this.element.innerText = 'DROP TO UPLOAD'; };
    this.element.ondragenter = () => { this.element.innerText = 'DROP TO UPLOAD'; };
    this.element.ondragleave = () => { this.element.innerText = 'HERE'; };
  }

  async sendFiles(files) {
    if (!files) throw Error('File error');
    const data = new FormData();
    Array.from(files).forEach((file) => {
      data.append(file.name, file);
    });
    await fetch('/admin', { method: 'POST', body: data/*  headers: { 'Content-Type': 'audio/mpeg' } */ }).then(this.loadFiles);
  }

  async loadFiles() {
    $(document.getElementById('files')).empty();
    const files = await fetch('/admin/files').then((res) => res.json());
    console.log(files);
    const fileElement = document.createElement('div');
    this.listElement.appendChild(fileElement);
  }
}

$(document).ready(async () => {
  const field = new DropField();
});
