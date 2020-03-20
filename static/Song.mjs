/* eslint-disable import/extensions */
import colors from './colors.mjs';

export default class Song {
  constructor(album, title, size) {
    this.mark = this.mark.bind(this);
    this.unmark = this.unmark.bind(this);
    this.play = this.play.bind(this);
    this.toggle = this.toggle.bind(this);
    this.addActionButton = this.addActionButton.bind(this);
    this.updateActionButton = this.updateActionButton.bind(this);

    this.element = document.createElement('div');
    this.element.className = 'song';
    this.element.onmouseover = () => {
      this.hovered = true;
      if (window.player.currentSong !== this) {
        this.mark();
      }
    };
    this.element.onmouseout = () => {
      this.hovered = false;
      if (window.player.currentSong !== this) {
        this.unmark();
      }
    };
    this.element.onclick = (e) => {
      if (this.element.offsetLeft + this.element.offsetWidth - e.clientX > 72) this.toggle();
      else this.addToPlaylist();
    };

    this.album = album;
    this.albumElement = document.createElement('div');
    this.albumElement.innerHTML = this.album;
    this.albumElement.className = 'albumTitle';
    this.element.appendChild(this.albumElement);

    this.title = title;
    this.titleElement = document.createElement('div');
    this.titleElement.innerHTML = this.title;
    this.titleElement.className = 'filename';
    this.element.appendChild(this.titleElement);

    this.size = size;
    this.sizeElement = document.createElement('div');
    this.sizeElement.innerHTML = `${this.size} MB`;
    this.sizeElement.className = 'filesize';
    this.element.appendChild(this.sizeElement);

    this.artist = album.split('-')[0].trim();
    this.artistElement = undefined;

    this.index = undefined;
    this.playing = false;
    this.actionButton = undefined;
    this.hovered = false;
    this.marked = false;
  }

  mark() {
    this.element.style.backgroundColor = colors.main;
    this.albumElement.style.color = 'white';
    this.titleElement.style.color = 'white';
    this.sizeElement.style.color = 'white';
    this.addActionButton();
    this.marked = true;
  }

  unmark() {
    this.element.style.backgroundColor = colors.background;
    this.albumElement.style.color = colors.text.light;
    this.titleElement.style.color = colors.text.main;
    this.sizeElement.style.color = colors.text.light;
    this.removeActionButton();
    this.marked = false;
  }

  addActionButton() {
    const action = document.createElement('div');
    action.className = 'actionButton';
    action.style.pointerEvents = 'none';

    const left = document.createElement('div');
    const actionImg = document.createElement('img');
    if (window.player.audio.paused) {
      actionImg.src = 'img/play.png';
    } else if (window.player.currentSong === this) {
      actionImg.src = 'img/pause.png';
    } else {
      actionImg.src = 'img/play.png';
    }
    left.appendChild(actionImg);
    left.onmouseover = () => { left.style.backgroundColor = 'red'; };
    action.appendChild(left);

    const right = document.createElement('div');
    const add = document.createElement('div');
    this.checkIfInPlaylist();
    if (this.alreadyIn) {
      add.innerHTML = '-';
    } else {
      add.innerHTML = '+';
    }
    right.appendChild(add);
    action.appendChild(right);

    this.actionButton = action;
    this.element.appendChild(this.actionButton);
  }

  removeActionButton() {
    if (this.actionButton) this.actionButton.remove();
    this.actionButton = undefined;
  }

  updateActionButton() {
    if (!this.playing) {
      this.actionButton.children[0].children[0].src = 'img/play.png';
    } else if (window.player.currentSong === this) {
      this.actionButton.children[0].children[0].src = 'img/pause.png';
    } else {
      this.actionButton.children[0].children[0].src = 'img/play.png';
    }

    this.checkIfInPlaylist();
    if (this.alreadyIn) {
      this.actionButton.children[1].children[0].innerHTML = '-';
    } else {
      this.actionButton.children[1].children[0].innerHTML = '+';
    }
  }

  toggle() {
    if (this.playing) window.player.pause();
    else this.play();
  }

  play() {
    window.player.choose(this);
    window.player.play();
  }

  async checkIfInPlaylist() {
    if (!window.playlistSongs) window.playlistSongs = await fetch('/playlist').then((res) => res.json());
    this.alreadyIn = window.playlistSongs.findIndex(
      (song) => JSON.stringify(
        { album: song.album, title: song.title, size: song.size }, null, 4,
      ) === JSON.stringify(
        { album: this.album, title: this.title, size: this.size }, null, 4,
      ),
    ) >= 0;
  }

  async addToPlaylist() {
    this.checkIfInPlaylist();
    if (!this.alreadyIn) {
      await fetch('/playlist',
        {
          method: 'POST',
          body: JSON.stringify({ album: this.album, title: this.title, size: this.size }),
          headers: { 'Content-type': 'application/json' },
        });
      this.updateActionButton();
    }
  }
}
