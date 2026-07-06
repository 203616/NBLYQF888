<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  title: { type: String, default: '' },
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] }
})

const chartRef = ref(null)
let chart

function render() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption({
    title: { text: props.title, left: 0, textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 36, right: 16, top: 48, bottom: 32 },
    xAxis: { type: 'category', data: props.labels },
    yAxis: { type: 'value' },
    series: [{ type: 'line', smooth: true, data: props.values, areaStyle: {} }]
  })
}

onMounted(render)
watch(() => [props.labels, props.values], render, { deep: true })
onBeforeUnmount(() => chart && chart.dispose())
</script>

<style scoped>
.chart {
  width: 100%;
  height: 320px;
}
</style>
