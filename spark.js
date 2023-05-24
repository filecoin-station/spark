import { assert } from 'zinnia:assert'

const getRetrieval = async () => {
  const res = await fetch('https://spark.fly.dev/retrievals', {
    method: 'POST'
  })
  return res.json()
}

const fetchCAR = async (cid) => {
  assert(cid)
  const url = `https://strn.pl/ipfs/${cid}`
  console.log('fetching', url)
  const res = await fetch(url)
  return res.arrayBuffer()
}

const retrieval = await getRetrieval()
console.log({ retrieval })
const car = await fetchCAR(retrieval.cid)
console.log('got CAR')
