<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: { type: Array, default: () => [] }
})

const chartRef = ref(null)
let chart

function render() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  const labels = props.data.map(item => `${item.province}${item.city ? '-' + item.city : ''}`)
  const values = props.data.map(item => Number(item.clues || 0) + Number(item.demands || 0) + Number(item.applications || 0))
  chart.setOption({
    title: { text: '地区业务热度', left: 0, textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 48, bottom: 70 },
    xAxis: { type: 'category', data: labels, axisLabel: { rotate: 25 } },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: values, itemStyle: { borderRadius: [6, 6, 0, 0] } }]
  })
}

onMounted(render)
watch(() => props.data, render, { deep: true })
onBeforeUnmount(() => chart && chart.dispose())
</script>

<style scoped>
.chart {
  width: 100%;
  height: 360px;
}
</style>
