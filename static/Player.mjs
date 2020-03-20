export default class Player {
  constructor() {
    this.toggle = this.toggle.bind(this);

    this.audio = document.getElementById('audio');
    this.source = document.getElementById('audio_src');
    [this.listElement] = document.getElementsByClassName('songsList');
    [this.currentTitle] = document.getElementsByClassName('currentTitle');
    [this.currentArtist] = document.getElementsByClassName('currentArtist');
    this.currentSong = undefined;
    this.songs = [];
    [this.timeBar] = document.getElementsByClassName('timeBar');
    [this.timeValue] = document.getElementsByClassName('timeValue');

    this.audio.onended = () => {
      this.currentSong.playing = false;
      this.currentSong.updateActionButton();
      const currentIndex = this.songs.findIndex((e) => e === this.currentSong);
      if (currentIndex < this.songs.length - 1) {
        this.choose(this.songs[currentIndex + 1]);
        this.play();
      }
    };

    this.audio.ontimeupdate = () => {
      if (this.audio.duration) {
        const percent = this.audio.currentTime / this.audio.duration;
        this.timeValue.style.width = `${percent * this.timeBar.offsetWidth}px`;
      }
    };

    const setTime = (e) => {
      if (this.audio.duration) {
        const pointX = e.clientX - window.innerWidth / 2 + 96 + 48;
        const percent = pointX / this.timeBar.offsetWidth;
        if (percent <= 1) {
          this.audio.currentTime = percent * this.audio.duration;
          this.timeValue.style.width = `${percent * this.timeBar.offsetWidth}px`;
        }
      }
    };

    this.timeBar.onmousedown = (event) => {
      setTime(event);
      document.body.onmousemove = (e) => {
        setTime(e);
      };
    };

    document.body.onmouseup = () => { document.body.onmousemove = undefined; };
    document.onmouseout = (e) => {
      if (e.toElement == null && e.relatedTarget == null) {
        document.body.onmousemove = undefined;
      }
    };

    [this.next] = document.getElementsByClassName('next');
    this.next.onclick = () => {
      const currentIndex = this.songs.findIndex((e) => e === this.currentSong);
      if (currentIndex < this.songs.length - 1) {
        this.choose(this.songs[currentIndex + 1]);
        this.play();
      }
    };
    [this.back] = document.getElementsByClassName('back');
    this.back.onclick = () => {
      const currentIndex = this.songs.findIndex((e) => e === this.currentSong);
      if (currentIndex !== 0) {
        this.choose(this.songs[currentIndex - 1]);
        this.play();
      }
    };

    document.onkeydown = (e) => {
      if (e.which === 32) {
        this.toggle();
      }
    };

    [this.playButton] = document.getElementsByClassName('play');
    this.playButton.onclick = this.toggle;
  }

  clear() {
    this.listElement.innerHTML = '';
    this.songs = [];
  }

  choose(song) {
    if (this.currentSong !== song) {
      if (this.currentSong) {
        this.pause();
        this.currentSong.unmark();
      }
      this.currentSong = song;
      this.source.src = `/mp3/${encodeURI(song.album)}/${encodeURI(song.title)}.mp3`;
      this.audio.load();

      this.currentTitle.innerHTML = song.title;
      this.currentArtist.innerHTML = song.artist;
    }
  }

  toggle() {
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  play() {
    const [play] = document.getElementsByClassName('play');
    if (!this.currentSong) this.choose(this.songs[0]);
    if (!this.currentSong.marked) this.currentSong.mark();
    this.currentSong.playing = true;
    this.currentSong.updateActionButton();
    this.audio.play();
    play.children[0].src = 'img/pause.png';
  }

  pause() {
    const [play] = document.getElementsByClassName('play');
    this.currentSong.playing = false;
    this.currentSong.updateActionButton();
    this.audio.pause();
    play.children[0].src = 'img/play.png';
  }

  addSong(song) {
    this.listElement.appendChild(song.element);
    this.songs.push(song);
  }
}
