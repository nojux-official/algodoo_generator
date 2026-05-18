<script setup lang="ts">
interface Props {
  modelValue: string
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  error: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const insertExample = () => {
  const example = `circles:
  - name: "orbital_ring"
    centerX: 0
    centerY: 0
    count: 12
    equations:
      angle: "i * (2 * PI / count)"
      distance: "100 + 20 * sin(i * 0.5)"
      radius: "10"
      color: "'#FF5733'"
`
  emit('update:modelValue', example)
}
</script>

<template>
  <div class="editor-container">
    <div class="editor-header">
      <h2>Parametric Equations</h2>
      <button @click="insertExample" class="btn-example">Insert Example</button>
    </div>

    <textarea
      :value="modelValue"
      @input="handleInput"
      class="yaml-editor"
      placeholder="Enter YAML configuration for circles..."
    />

    <div v-if="error" class="error-display">
      <strong>Error:</strong> {{ error }}
    </div>

    <div class="helper-text">
      <p><strong>Variables available in equations:</strong></p>
      <ul>
        <li><code>i</code> - Current iteration (0 to count-1)</li>
        <li><code>count</code> - Total number of circles</li>
        <li><code>PI</code> - Math constant π</li>
        <li><code>sin(), cos(), tan()</code> - Trigonometric functions</li>
        <li><code>sqrt(), abs(), pow(), exp(), log()</code> - Math functions</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  background-color: #fafafa;
  border-right: 1px solid #ddd;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.editor-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.btn-example {
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-example:hover {
  background-color: #0056b3;
}

.yaml-editor {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: none;
  overflow-y: auto;
}

.yaml-editor:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.error-display {
  margin-top: 10px;
  padding: 10px;
  background-color: #ffe0e0;
  border: 1px solid #ff5555;
  border-radius: 4px;
  color: #d00;
  font-size: 12px;
  max-height: 80px;
  overflow-y: auto;
}

.helper-text {
  margin-top: 12px;
  padding: 10px;
  background-color: #e8f4f8;
  border-left: 3px solid #17a2b8;
  border-radius: 3px;
  font-size: 11px;
  color: #0c5460;
}

.helper-text p {
  margin: 0 0 8px 0;
  font-weight: bold;
}

.helper-text ul {
  margin: 0;
  padding-left: 20px;
}

.helper-text li {
  margin: 4px 0;
}

.helper-text code {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 4px;
  border-radius: 2px;
  font-family: monospace;
}
</style>
