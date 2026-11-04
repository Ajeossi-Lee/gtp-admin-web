<template>
  <div class="home-page">
    <section class="panel">
      <header class="panel-head">
        <h1 class="panel-title">Welcome back, {{ userStore.displayName }}</h1>
        <p class="panel-desc">Protein records, images, and mouse strain data.</p>
      </header>
      <div class="stats">
        <button
          v-for="item in stats"
          :key="item.path"
          type="button"
          class="stat"
          @click="router.push(item.path)"
        >
          <span class="stat-label">{{ item.title }}</span>
          <span class="stat-value">{{ item.value }}</span>
          <span class="stat-tip">{{ item.tip }}</span>
        </button>
      </div>
    </section>

    <section class="panel">
      <header class="panel-head">
        <h2 class="panel-title">Data</h2>
      </header>
      <button
        v-for="item in modules"
        :key="item.path"
        type="button"
        class="module-row"
        @click="router.push(item.path)"
      >
        <span class="module-main">
          <span class="module-icon">
            <el-icon :size="18">
              <component :is="item.icon" />
            </el-icon>
          </span>
          <span class="module-text">
            <span class="module-name">{{ item.title }}</span>
            <span class="module-desc">{{ item.desc }}</span>
          </span>
        </span>
        <Right class="module-go" theme="outline" size="18" fill="currentColor" />
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Connection, Notebook, Picture, Upload } from '@element-plus/icons-vue'
import { Right } from '@icon-park/vue-next'
import '@icon-park/vue-next/styles/index.css'
import useUserStore from '@/store/modules/user'
import { getProteinInfoPage } from '@/service/api/proteinInfo'
import { getProteinImagesPage } from '@/service/api/proteinImages'
import { getGeneGtpPage } from '@/service/api/geneGtp'

defineOptions({
  name: 'HomeIndex'
})

const router = useRouter()
const userStore = useUserStore()
const proteinTotal = ref(0)
const proteinImagesTotal = ref(0)
const geneGtpTotal = ref(0)

const stats = computed(() => [
  {
    path: '/protein-info',
    title: 'Protein Info',
    value: proteinTotal.value,
    tip: 'Records'
  },
  {
    path: '/protein-images',
    title: 'Protein Images',
    value: proteinImagesTotal.value,
    tip: 'Images'
  },
  {
    path: '/gene-gtp',
    title: 'GTP Mouse Strain',
    value: geneGtpTotal.value,
    tip: 'Strains'
  }
])

const modules = [
  {
    path: '/protein-info',
    title: 'Protein Info',
    desc: 'Gene, protein name, UniProt and chromosome',
    icon: Notebook
  },
  {
    path: '/protein-images',
    title: 'Protein Images',
    desc: 'Browse images already stored for each protein',
    icon: Picture
  },
  {
    path: '/protein-image-submit',
    title: 'Submit Images',
    desc: 'Upload a new image batch and check its status',
    icon: Upload
  },
  {
    path: '/gene-gtp',
    title: 'GTP Mouse Strain',
    desc: 'Gene names, mouse strains and GTP links',
    icon: Connection
  }
]

const loadTotals = async () => {
  try {
    const [proteinRes, proteinImagesRes, geneGtpRes] = await Promise.all([
      getProteinInfoPage({ page: 1, pageSize: 1 }),
      getProteinImagesPage({ page: 1, pageSize: 1 }),
      getGeneGtpPage({ page: 1, pageSize: 1 })
    ])
    proteinTotal.value = proteinRes.data?.total || 0
    proteinImagesTotal.value = proteinImagesRes.data?.total || 0
    geneGtpTotal.value = geneGtpRes.data?.total || 0
  } catch {
    // Keep totals at 0 when stats fail; request interceptor shows the error
  }
}

onMounted(() => {
  loadTotals()
})
</script>

<style scoped>
.home-page {
  min-height: 100%;
  padding: 8px 28px 28px;
  background: linear-gradient(180deg, #f6f7fb 0%, #f3f4f8 100%);
}

.panel {
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid rgba(29, 33, 41, 0.06);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  overflow: hidden;
}

.panel-head {
  padding: 18px 24px;
  border-bottom: 1px solid #f2f3f5;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #1d2129;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.panel-title::before {
  content: '';
  width: 3px;
  height: 16px;
  border-radius: 2px;
  background: #165dff;
  flex: none;
}

.panel-desc {
  margin: 6px 0 0 11px;
  color: #86909c;
  font-size: 13px;
  line-height: 20px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stat,
.module-row {
  display: flex;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.stat {
  flex-direction: column;
  padding: 22px 24px 24px;
  border-right: 1px solid #f2f3f5;
}

.stat:last-child {
  border-right: 0;
}

.stat:hover,
.module-row:hover {
  background: #f7f8fa;
}

.stat-label {
  color: #4e5969;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
}

.stat-value {
  margin-top: 8px;
  color: #1d2129;
  font-size: 32px;
  font-weight: 600;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}

.stat-tip {
  margin-top: 6px;
  color: #86909c;
  font-size: 13px;
  line-height: 20px;
}

.module-row {
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  border-top: 1px solid #f2f3f5;
}

.panel .module-row:first-of-type {
  border-top: 0;
}

.module-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.module-icon {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #e8f3ff;
  color: #165dff;
}

.module-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
}

.module-name {
  color: #1d2129;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}

.module-desc {
  color: #86909c;
  font-size: 13px;
  line-height: 20px;
}

.module-go {
  flex: none;
  display: inline-flex;
  color: #165dff;
}

@media (max-width: 900px) {
  .home-page {
    padding: 8px 16px 20px;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .stat {
    border-right: 0;
    border-bottom: 1px solid #f2f3f5;
  }

  .stat:last-child {
    border-bottom: 0;
  }
}
</style>
