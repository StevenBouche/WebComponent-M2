
import Express from 'express'
import fs from 'fs'

const app = Express()
const port = 3000

// Cette ligne indique le répertoire qui contient
// les fichiers statiques: html, css, js, images etc.
app.use(Express.static('public'))
//app.use(Express.static('bundle'))
app.use(Express.static('dist'));
app.get('/', (req, res) => {
  res.render('index')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
