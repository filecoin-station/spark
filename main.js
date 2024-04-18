import Spark from './lib/spark.js'

if (!Zinnia.stationId) {
  Zinnia.activity.error('Your Station version is outdated. Please upgrade it as soon as possible.')
}

const spark = new Spark()
await spark.run()
