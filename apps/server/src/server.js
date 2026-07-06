const app = require('./app')
const { port } = require('./config')

app.listen(port, () => {
  console.log(`Liangye API server listening on http://localhost:${port}/api/v1`)
})
