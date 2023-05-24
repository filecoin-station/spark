const res = await fetch('https://spark.fly.dev/retrievals', {
  method: 'POST'
})
const retrieval = await res.json()
console.log({ retrieval })
