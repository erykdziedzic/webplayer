const Datastore = require('nedb');

class Playlist {
  constructor() {
    this.datastore = new Datastore({
      filename: 'playlist.db',
      autoload: true,
    });
  }

  removeSong(id) {
    this.datastore.remove({ _id: id }, {});
  }

  loadSongs(res) {
    this.datastore.find({}, (err, docs) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(docs));
    });
  }

  addSong(album, title, size) {
    const song = { album, title, size };
    this.datastore.insert(song);
  }
}

const playlist = new Playlist();

module.exports = {
  playlist,
};
