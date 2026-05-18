<script setup lang="ts">
import { useEquationParser } from '@/composables/useEquationParser'
import EquationEditor from '@/components/EquationEditor.vue'
import CirclePreview from '@/components/CirclePreview.vue'

const { yamlContent, parseError, circles } = useEquationParser()
</script>

<template>
  <div class="editor-layout">
    <div class="editor-panel">
      <EquationEditor v-model="yamlContent" :error="parseError" />
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
