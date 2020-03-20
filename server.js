/* eslint-disable no-console */
const http = require('http')
const fs = require('fs')
const { IncomingForm } = require('formidable')
const { playlist } = require('./playlist.js')

http.globalAgent.keepAlive = true

const sendAlbums = (req, res) => {
  let allData = ''
  req.on('data', (data) => { allData += data })
  req.on('end', () => {
    const finish = JSON.parse(allData)

    fs.readdir(`${__dirname}/static/mp3`, (err, dirs) => {
      if (err) return console.log(err)

      let album
      if (!finish.album) [album] = dirs
      else album = dirs.find((dir) => dir === finish.album)

      const songs = []
      fs.readdir(`${__dirname}/static/mp3/${album}`, (err2, files) => {
        if (err2) return console.log(err2)

        files.forEach((file) => {
          const { size } = fs.statSync(`${__dirname}/static/mp3/${album}/${file}`)
          songs.push({ file, size, album })
        })

        res.writeHead(200, { 'content-type': 'application/json;charset=utf-8' })
        res.end(JSON.stringify({ dirs, files: songs }), null, 4)
      })
    })
  })
}

const getPlaylist = (req, res) => {
  playlist.loadSongs(res)
}

const addToPlaylist = (req, res) => {
  let allData = ''
  req.on('data', (data) => { allData += data })
  req.on('end', () => {
    const data = JSON.parse(allData)
    playlist.addSong(data.album, data.title, data.size)
    res.end()
  })
}

const removeFromPlaylist = (req, res) => {
  let allData = ''
  req.on('data', (data) => { allData += data })
  req.on('end', () => {
    const data = JSON.parse(allData)
    playlist.removeSong(data.id)
    res.end()
  })
}

const saveFiles = (req, res) => {
  const form = new IncomingForm({ multiples: true })
  const path = `static/upload/${Date.now()}`
  fs.mkdirSync(path)
  form.uploadDir = path
  form.keepExtensions = true

  form.on('file', (field, file) => {
    fs.rename(file.path, `${path}/${file.name}`, () => {})
  })

  form.parse(req, () => {
    res.writeHead(200, { 'content-type': 'text/plain;charset=utf-8' })
    res.end()
  })
}

const getFiles = (req, res) => {
  fs.readdir('static/upload/', (err, dirs) => {
    if (err) console.error(err)
    res.writeHead(200, { 'content-type': 'application/json;charset=utf-8' })
    res.end(JSON.stringify({ dirs }), null, 4)
  })
}

const server = http.createServer((req, res) => {
  let path
  switch (req.method) {
    case 'GET':
      if (req.url === '/playlist') {
        getPlaylist(req, res); return
      } if (req.url === '/') {
        path = '/index.html'
      } else if (req.url === '/admin') {
        path = '/admin.html'
      } else if (req.url === '/admin/files') {
        getFiles(req, res); return
      } else { path = decodeURI(req.url) }
      fs.readFile(`static${path}`, (error, data) => {
        if (error) {
          console.error(error)
          res.writeHead(404, { 'Content-Type': 'text/plain' })
          res.write('404 Not found\n')
          res.end()
        } else {
          const ext = path.substr(path.lastIndexOf('.') + 1)
          switch (ext) {
            case 'js':
              res.writeHead(200, { 'Content-Type': 'application/javascript' })
              break
            case 'mjs':
              res.writeHead(200, { 'Content-Type': 'application/javascript' })
              break
            case 'css':
              res.writeHead(200, { 'Content-Type': 'text/css' })
              break
            case 'html':
              res.writeHead(200, { 'Content-Type': 'text/html' })
              break
            case 'mp3': {
              const { size } = fs.statSync(`static${path}`)
              res.writeHead(200, {
                'Content-Type': 'audio/mpeg',
                'Content-Length': size,
                'Accept-Ranges': 'bytes'
              })
              break
            }
            default:
              res.writeHead(200, { 'Content-Type': '' })
          }
          res.write(data)
          res.end()
        }
      })
      break
    case 'POST':
      if (req.url === '/albums') sendAlbums(req, res)
      else if (req.url === '/playlist') addToPlaylist(req, res)
      else if (req.url === '/admin') saveFiles(req, res)
      break
    case 'DELETE':
      if (req.url === '/playlist') removeFromPlaylist(req, res)
      break
    default:
  }
})

server.listen(3000, '0.0.0.0', () => {
  console.log('serwer startuje na porcie 3000')
})
