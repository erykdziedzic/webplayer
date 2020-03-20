/* eslint-disable import/extensions */
import Song from './Song.mjs';
import Player from './Player.mjs';

const loadSongs = async (albumName) => {
  const data = await fetch('/albums',
    {
      method: 'POST',
      body: JSON.stringify({ album: albumName }),
      headers: { 'Content-type': 'application/json' },
    }).then((response) => response.json());

  const [albumsContainer] = document.getElementsByClassName('albumsContainer');
  $(albumsContainer).empty();
  data.dirs.forEach((dir) => {
    const album = document.createElement('img');
    album.className = 'albumCover';
    album.src = `/mp3/${dir}/Cover.jpg`;
    $(album).attr('albumName', dir);
    album.onclick = () => loadSongs(dir);

    albumsContainer.appendChild(album);
  });

  window.player.clear();
  data.files.forEach((file) => {
    if (file.file.endsWith('mp3')) {
      const song = new Song(
        file.album,
        file.file.slice(0, file.file.length - 4),
        Math.round((file.size / 1024 / 1024) * 100) / 100,
      );
      window.player.addSong(song);
    }
  });
};

const loadPlaylist = async () => {
  window.player.clear();
  window.playlistSongs = await fetch('/playlist').then((res) => res.json());
  window.playlistSongs.forEach((file) => {
    const song = new Song(
      file.album,
      file.title,
      file.size,
    );
    window.player.addSong(song);
  });
};

$(document).ready(async () => {
  window.player = new Player();
  const [app] = document.getElementsByClassName('app');
  app.style.height = `${window.innerHeight}px`;
  window.onresize = () => { app.style.height = `${window.innerHeight}px`; };
  loadSongs();
  document.getElementById('playlist').onclick = () => loadPlaylist();
});
