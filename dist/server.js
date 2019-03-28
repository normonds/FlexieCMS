const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
	res.send(`<!DOCTYPE html><html>
    <head>
        <meta charset="UTF-8" />
        <title>Hello React!</title>
    </head>
    <body>
        <div id="example"></div>

        <!-- Main -->
        <script src="bundle.js"></script>
    </body>
</html>`);
	//res.send('');
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))