import { assertEquals } from 'zinnia:assert'

const getRetrieval = async () => {
  console.log('Geting retrieval...')
  const res = await fetch('https://spark.fly.dev/retrievals', {
    method: 'POST'
  })
  const retrieval = await res.json()
  console.log({ retrieval })
  return retrieval
}

const fetchCAR = async (url) => {
  console.log('Fetching CAR...')
  const res = await fetch(url)
  const car = await res.arrayBuffer()
  console.log(`Downloaded ${car.byteLength} bytes`)
  return car
}

const submitRetrieval = async ({ success }) => {
  console.log('Submitting retrieval...')
  const res = await fetch(`https://spark.fly.dev/retrievals/${retrieval.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ success }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  assertEquals(res.status, 200, await res.text().catch(() => ''))
  console.log('Retrieval submitted')
}

const retrieval = await getRetrieval()

let success = true
const url = `https://strn.pl/ipfs/${retrieval.cid}`
try {
  await fetchCAR(url)
} catch (err) {
  console.error(`Failed to fetch ${url}`)
  console.error(err)
  success = false
}

await submitRetrieval({ success })
