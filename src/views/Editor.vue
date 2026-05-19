<script setup lang="ts">
import { computed } from 'vue'
import { useEquationStore } from '@/stores/equation'
import { useEquationParser } from '@/composables/useEquationParser'
import EquationEditor from '@/components/EquationEditor.vue'
import CirclePreview from '@/components/CirclePreview.vue'

const equationStore = useEquationStore()
const { parseCircles, parseError: parseErrorRef } = useEquationParser()

// Parse circles from store content
const parseResult = computed(() => parseCircles(equationStore.yamlContent))
const circles = computed(() => parseResult.value.circles)
const parseError = computed(() => parseResult.value.error)
</script>

<template>
  <div class="editor-layout">
    <div class="editor-panel">
      <EquationEditor :error="parseError" />
    </div>
    <div class="preview-panel">
      <CirclePreview :circles="circles" />
    </div>
  </div>
</template>

<style scoped>
.editor-layout {
  display: flex;
  height: 100%;
  width: 100%;
}

.editor-panel {
  width: 40%;
  min-width: 300px;
  overflow: hidden;
}

.preview-panel {
  width: 60%;
  min-width: 300px;
  overflow: hidden;
}
</style>
