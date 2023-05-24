import { assertEquals } from 'zinnia:assert'

// TODO: Add timeout

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
  const stats = {
    start: new Date(),
    firstByte: null,
    end: null,
    byteLength: 0,
    status: null
  }
  console.log('Fetching CAR...')
  const controller = new AbortController()
  const { signal } = controller
  const res = await fetch(url, { signal })
  stats.status = res.status

  if (res.ok) {
    // Abort if no data is received for 10 seconds
    let timeout
    const startTimeout = () => {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => controller.abort(), 10_000)
    }
    startTimeout()

    try {
      for await (const value of res.body) {
        if (stats.firstByte === null) {
          stats.firstByte = new Date()
        }
        stats.byteLength += value.byteLength
        startTimeout()
      }
    } finally {
      clearTimeout(timeout)
    }
  }
  stats.end = new Date()
  console.log(stats)
}

const submitRetrieval = async ({ id, success }) => {
  console.log('Submitting retrieval...')
  const res = await fetch(`https://spark.fly.dev/retrievals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ success }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  assertEquals(res.status, 200, await res.text().catch(() => ''))
  console.log('Retrieval submitted')
}

const sleep = dt => new Promise(resolve => setTimeout(resolve, dt))

while (true) {
  try {
    const retrieval = await getRetrieval()

    let success = false
    const url = `https://strn.pl/ipfs/${retrieval.cid}`
    try {
      await fetchCAR(url)
      success = true
    } catch (err) {
      console.error(`Failed to fetch ${url}`)
      console.error(err)
    }

    await submitRetrieval({ id: retrieval.id, success })
    Zinnia.jobCompleted()
  } catch (err) {
    Zinnia.activity.error('SPARK failed reporting retrieval')
    console.error(err)
  }

  await sleep(1_000)
}
