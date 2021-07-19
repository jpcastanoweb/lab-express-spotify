require("dotenv").config()

const express = require("express")
const hbs = require("hbs")

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node")

const app = express()

app.set("view engine", "hbs")
app.set("views", __dirname + "/views")
app.use(express.static(__dirname + "/public"))
hbs.registerPartials(__dirname + "/views/partials")

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
})

spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  )

// Our routes go here:

app.get("/", (req, res) => {
  res.render("index")
})

app.get("/artist-search", (req, res) => {
  spotifyApi
    .searchArtists(req.query.artist)
    .then((data) => {
      res.render("artist-search-results", {
        query: req.query.artist,
        results: data.body.artists.items,
      })
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    )
})

app.get("/albums/:artistId", (req, res) => {
  const artistId = req.params.artistId
  spotifyApi
    .getArtist(artistId)
    .then((data) => {
      const artistName = data.body.name
      spotifyApi
        .getArtistAlbums(artistId)
        .then((data) => {
          res.render("albums", {
            albums: data.body.items,
            name: artistName,
          })
        })
        .catch((e) => console.log(e))
    })
    .catch((e) => console.log(e))
})

app.get("/tracks/:albumId", (req, res) => {
  const { albumId } = req.params

  spotifyApi
    .getAlbumTracks(albumId)
    .then((data) => {
      res.render("tracks", {
        tracks: data.body.items,
      })
    })
    .catch((e) => console.log(e))
})

app.listen(process.env.PORT, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
)
