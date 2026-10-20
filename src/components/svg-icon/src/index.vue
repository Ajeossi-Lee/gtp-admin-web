<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconHref" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'SvgIcon'
})

const props = defineProps({
  // Icon name
  iconName: {
    type: String,
    required: true
  },
  // Extra class name
  iconClass: {
    type: String,
    default: ''
  }
})

const iconHref = computed(() => `#icon-${props.iconName}`)
const svgClass = computed(() => `svg-icon ${props.iconClass}`)
</script>

<style lang="scss">
.svg-icon {
  fill: currentColor;
  overflow: hidden;
  position: relative;
  fill: currentColor;
  vertical-align: -2px;
}
</style>
