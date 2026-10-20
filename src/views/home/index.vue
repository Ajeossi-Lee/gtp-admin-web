<template>
  <div class="admin-page">
    <div class="welcome-card">
      <div class="welcome-title">Welcome to GTP Admin</div>
      <div class="welcome-desc">
        Signed in as {{ userStore.displayName }}. Manage protein info, protein images, and GTP mouse strain data.
      </div>
    </div>
    <div class="stat-grid">
      <div class="stat-card" @click="router.push('/protein-info')">
        <div class="stat-label">Protein Info</div>
        <div class="stat-value">{{ proteinTotal }}</div>
        <div class="stat-tip">Manage protein_info</div>
      </div>
      <div class="stat-card" @click="router.push('/protein-images')">
        <div class="stat-label">Protein Images</div>
        <div class="stat-value">{{ proteinImagesTotal }}</div>
        <div class="stat-tip">Manage protein_images</div>
      </div>
      <div class="stat-card" @click="router.push('/gene-gtp')">
        <div class="stat-label">GTP Mouse Strain</div>
        <div class="stat-value">{{ geneGtpTotal }}</div>
        <div class="stat-tip">Manage gene_gtp</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
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
.welcome-card {
  padding: 20px 24px;
  margin-bottom: 16px;
  border: 1px solid var(--border-2);
  border-radius: 8px;
  background: var(--fill-2);
}

.welcome-title {
  color: var(--text-1);
  font-size: 18px;
  font-weight: 600;
}

.welcome-desc {
  margin-top: 8px;
  color: var(--text-2);
  font-size: 14px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 20px 24px;
  border: 1px solid var(--border-2);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.stat-card:hover {
  border-color: var(--primary-light);
  box-shadow: 0 6px 16px rgba(22, 93, 255, 0.08);
}

.stat-label {
  color: var(--text-3);
  font-size: 14px;
}

.stat-value {
  margin: 12px 0 8px;
  color: var(--primary);
  font-size: 36px;
  font-weight: 700;
}

.stat-tip {
  color: var(--text-3);
  font-size: 13px;
}

@media (max-width: 768px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
