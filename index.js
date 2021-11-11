
import Express from 'express'

const app = Express()
const port = process.env.PORT || 8080;
app.use(Express.static('public'))
app.use(Express.static('dist'));

app.get('/', (req, res) => {
  res.render('index')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
