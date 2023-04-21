const express = require('express')
const app = express()
const port = 3000

const {InfluxDB, Point} = require('@influxdata/influxdb-client')
const token = 'my-super-secret-auth-token'
const url = 'http://localhost:8086'
const client = new InfluxDB({url, token})

let org = `my-org`
let bucket = `my-bucket`



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/insert', (req, res) => {

  let writeClient = client.getWriteApi(org, bucket, 'ns')

for (let i = 0; i < 5; i++) {
  let point = new Point('measurement1')
    .tag('tagname1', 'tagvalue1')
    .intField('field1',Math.random()*10)

  void setTimeout(() => {
    writeClient.writePoint(point)
  }, i * 1000) // separate points by 1 second

  void setTimeout(() => {
    writeClient.flush()
  }, 5000)
}
  res.send('Data Insert Done')
})


app.get('/read', (req, res) => {

let queryClient = client.getQueryApi(org)
let fluxQuery = `from(bucket: "my-bucket")
 |> range(start: -10m)
 |> filter(fn: (r) => r._measurement == "measurement1")`

let data = []
queryClient.queryRows(fluxQuery, {
  next: (row, tableMeta) => {
    const tableObject = tableMeta.toObject(row)
    data = data + JSON.stringify(tableObject) + '<br/>'
   // console.log(tableObject)
  },
  error: (error) => {
    res.send('Error!')
  },
  complete: () => {
    res.send('Success: <hr/>' + data)
  },
})



  
})


app.get('/query', (req, res) => {
let data = ''
  queryClient = client.getQueryApi(org)
fluxQuery = `from(bucket: "my-bucket")
 |> range(start: -120m)
 |> filter(fn: (r) => r._measurement == "measurement1")
 |> mean()`

queryClient.queryRows(fluxQuery, {
  next: (row, tableMeta) => {
    const tableObject = tableMeta.toObject(row)
    
    data = data + JSON.stringify(tableObject) + '<br/>'
  },
  error: (error) => {
    res.send('Error!')
  },
  complete: () => {
    res.send('Success: <hr/>' + data)
  },
})
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
