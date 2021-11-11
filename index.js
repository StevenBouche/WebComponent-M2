
import Express from 'express'

const app = Express()

app.use(Express.static('public'))
app.use(Express.static('dist'));

app.get('/', (req, res) => {
  res.render('index')
})

app.listen(process.env.PORT || 8080, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
