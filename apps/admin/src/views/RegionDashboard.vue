<template>
  <div class="region-dashboard">
    <div class="page-header">
      <h2>地区数据看板</h2>
      <p>各地区线索、需求与申请统计，数据来源可追溯</p>
    </div>

    <el-row :gutter="16">
      <el-col :span="14">
        <div class="page-card chart-card">
          <h3 class="section-title">全国业务分布</h3>
          <ChinaMapChart :data="regions" />
        </div>
      </el-col>
      <el-col :span="10">
        <div class="page-card chart-card">
          <LineChart title="地区线索趋势" :labels="labels" :values="clueValues" />
        </div>
      </el-col>
    </el-row>

    <div class="stat-chips">
      <div class="chip" v-for="item in summary" :key="item.label">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </div>
    </div>

    <div class="page-card table-card">
      <div class="table-toolbar">
        <h3 class="section-title">地区数据明细</h3>
        <span class="update-time">更新时间：{{ updatedAt || '-' }}</span>
      </div>
      <el-table :data="regions" stripe highlight-current-row :empty-text="'暂无地区数据'">
        <el-table-column prop="province" label="省份" width="120" />
        <el-table-column prop="city" label="城市" width="120" />
        <el-table-column prop="clues" label="线索" width="90">
          <template #default="{ row }">
            <el-tag type="success" size="small" effect="plain">{{ row.clues || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="demands" label="需求" width="90" />
        <el-table-column prop="applications" label="申请" width="90" />
        <el-table-column prop="sourceName" label="数据来源" min-width="180" show-overflow-tooltip />
        <el-table-column prop="sourceUrl" label="来源链接" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <a v-if="row.sourceUrl" :href="row.sourceUrl" target="_blank" class="link-cell">查看</a>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getRegionStats } from '../api/analytics'
import ChinaMapChart from '../components/charts/ChinaMapChart.vue'
import LineChart from '../components/charts/LineChart.vue'

const regions = ref([])
const updatedAt = ref('')

const labels = computed(() => regions.value.map(item => item.city || item.province))
const clueValues = computed(() => regions.value.map(item => item.clues || 0))

const summary = computed(() => {
  const list = regions.value
  return [
    { label: '覆盖城市', value: list.length },
    { label: '线索合计', value: list.reduce((s, r) => s + (r.clues || 0), 0) },
    { label: '需求合计', value: list.reduce((s, r) => s + (r.demands || 0), 0) },
    { label: '申请合计', value: list.reduce((s, r) => s + (r.applications || 0), 0) }
  ]
})

onMounted(async () => {
  const data = await getRegionStats()
  regions.value = data.list || []
  updatedAt.value = data.updatedAt || ''
})
</script>

<style scoped>
.region-dashboard .chart-card {
  margin-bottom: 16px;
}

.stat-chips {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.chip {
  background: #fff;
  border: 1px solid var(--brand-border);
  border-radius: 12px;
  padding: 12px 24px;
  text-align: center;
}

.chip strong {
  display: block;
  font-size: 24px;
  color: var(--brand-primary);
}

.chip span {
  font-size: 12px;
  color: var(--brand-muted);
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.update-time {
  font-size: 13px;
  color: var(--brand-muted);
}

.link-cell {
  color: var(--brand-primary);
  text-decoration: none;
}
</style>
