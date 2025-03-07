const express = require('express')
const app = express()
const port = 8080
app.use(express.static('./dist'))

// respond with "hello world" when a GET request is made to the homepage
app.get('/*', (req, res) => {
	res.sendFile('./dist/index.html', { root: __dirname })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})