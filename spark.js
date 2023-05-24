import { assertEquals } from 'zinnia:assert'

const getRetrieval = async () => {
  const res = await fetch('https://spark.fly.dev/retrievals', {
    method: 'POST'
  })
  return res.json()
}

const fetchCAR = async (url) => {
  const res = await fetch(url)
  return res.arrayBuffer()
}

const submitRetrieval = async ({ success }) => {
  const res = await fetch(`https://spark.fly.dev/retrievals/${retrieval.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ success }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  assertEquals(res.status, 200)
  assertEquals(await res.text(), 'OK')
}

const retrieval = await getRetrieval()
console.log({ retrieval })

let success = true
const url = `https://strn.pl/ipfs/${retrieval.cid}`
try {
  await fetchCAR(url)
} catch (err) {
  console.error(`Failed to fetch ${url}`)
  console.error(err)
  success = false
}
console.log({ success })

await submitRetrieval({ success })
console.log('submitted')
