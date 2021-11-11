class RmsProcessor extends AudioWorkletProcessor {
  process (inputs, outputs, parameters) {
    return true
  }
}

registerProcessor('test-processor', RmsProcessor)