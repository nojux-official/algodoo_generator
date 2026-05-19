<script setup lang="ts">
import { useEquationStore, EQUATION_EXAMPLES } from '@/stores/equation'

interface Props {
  error?: string
}

withDefaults(defineProps<Props>(), {
  error: undefined
})

const equationStore = useEquationStore()

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  equationStore.setYamlContent(target.value)
}

const loadExample = (exampleKey: string) => {
  equationStore.loadExample(exampleKey as keyof typeof EQUATION_EXAMPLES)
}

const clearAll = () => {
  if (confirm('Clear all content and reset to default?')) {
    equationStore.resetToDefault()
  }
}
</script>

<template>
  <div class="editor-container">
    <div class="editor-header">
      <h2>Parametric Equations</h2>
      <div class="header-buttons">
        <div class="example-selector">
          <label for="example-select">Example:</label>
          <select
            id="example-select"
            @change="(e) => loadExample((e.target as HTMLSelectElement).value)"
            class="example-dropdown"
          >
            <option value="orbital_ring">Orbital Ring</option>
            <option value="spiral">Spiral</option>
            <option value="grid">Grid Pattern</option>
            <option value="wave">Wave Pattern</option>
            <option value="fibonacci">Fibonacci Spiral</option>
          </select>
        </div>
        <button @click="clearAll" class="btn-clear">Clear</button>
      </div>
    </div>

    <textarea
      :value="equationStore.yamlContent"
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
        <li><code>atan2(y, x)</code> - Arc tangent for angles</li>
        <li><code>floor()</code> - Round down</li>
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
  gap: 8px;
}

.editor-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
  flex: 1;
}

.header-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.example-selector {
  display: flex;
  gap: 6px;
  align-items: center;
}

.example-selector label {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

.example-dropdown {
  padding: 6px 8px;
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
}

.example-dropdown:hover {
  border-color: #007bff;
}

.example-dropdown:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.btn-clear {
  padding: 6px 12px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-clear:hover {
  background-color: #5a6268;
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
