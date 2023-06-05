/* global Zinnia */

// Create activity events when we go online or offline
export class ActivityState {
  #ok = null

  onError () {
    if (this.#ok === null || this.#ok) {
      this.#ok = false
      Zinnia.activity.error('SPARK failed reporting retrieval')
    }
  }

  onSuccess () {
    if (this.#ok === null) {
      this.#ok = true
      Zinnia.activity.info('SPARK started reporting retrievals')
    } else if (!this.#ok) {
      this.#ok = true
      Zinnia.activity.info('SPARK retrieval reporting resumed')
    }
  }
}
