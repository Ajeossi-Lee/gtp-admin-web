<template>
  <div class="submit-page">
    <header class="page-head">
      <h2>Submit Images</h2>
    </header>

    <section class="panel filter-panel">
      <div class="admin-filter">
        <div class="fi">
          <label>Protein</label>
          <el-input v-model="form.protein" placeholder="Enter protein name" maxlength="100" />
        </div>
        <div class="fi">
          <label>Gene</label>
          <el-input v-model="form.gene" placeholder="Enter gene name" maxlength="100" />
        </div>
        <div class="fi">
          <label>Ensemble ID</label>
          <el-input v-model="form.ensembleId" placeholder="Enter Ensemble ID" maxlength="100" />
        </div>
        <div class="fi btns">
          <el-button type="primary" :loading="creating" @click="handleGenerate">
            Generate
          </el-button>
        </div>
        <div class="fi">
          <label>Method</label>
          <el-select v-model="form.method" placeholder="Select method">
            <el-option
              v-for="item in methodOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="fi">
          <label>Stage</label>
          <el-select v-model="form.stage" placeholder="Select stage">
            <el-option
              v-for="item in stageOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="fi">
          <label>Location</label>
          <el-input v-model="form.location" placeholder="Enter location" maxlength="100" />
        </div>
        <div class="fi"></div>
        <div class="fi">
          <label>Detected</label>
          <el-switch v-model="form.detection" />
        </div>
        <div class="fi wide">
          <label>Image dir</label>
          <el-input v-model="form.imageDir" placeholder="e.g. Atad2 oocyte ICSI 2-cell_A" maxlength="500" />
        </div>
      </div>
    </section>

    <section class="panel table-panel">
      <el-table v-loading="loading" :data="tableData" class="data-table">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="protein" label="Protein" min-width="110" show-overflow-tooltip />
        <el-table-column prop="gene" label="Gene" min-width="110" show-overflow-tooltip />
        <el-table-column prop="ensembleId" label="Ensemble ID" min-width="150" show-overflow-tooltip />
        <el-table-column prop="method" label="Method" width="110">
          <template #default="{ row }">
            {{ methodLabel(row.method) }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="Location" width="100" show-overflow-tooltip />
        <el-table-column prop="detection" label="Detected" width="90">
          <template #default="{ row }">
            {{ row.detection ? 'TRUE' : 'FALSE' }}
          </template>
        </el-table-column>
        <el-table-column prop="stage" label="Stage" width="110">
          <template #default="{ row }">
            {{ stageLabel(row.stage) }}
          </template>
        </el-table-column>
        <el-table-column prop="imageDir" label="Image dir" min-width="160" show-overflow-tooltip />
        <el-table-column label="OIR file" min-width="180">
          <template #default="{ row }">
            <button
              type="button"
              class="oir-link"
              :disabled="row.status === 'processing' || uploadingId === row.id"
              @click="triggerUpload(row)"
            >
              {{ uploadingId === row.id ? 'Uploading...' : oirLabel(row) }}
            </button>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120">
          <template #default="{ row }">
            <el-tooltip v-if="row.status === 'failed' && row.errorMessage" :content="row.errorMessage" placement="top">
              <el-tag :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
            </el-tooltip>
            <el-tag v-else :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button
                type="primary"
                link
                :disabled="!canSubmit(row) || submittingId === row.id"
                :loading="submittingId === row.id"
                @click="handleSubmit(row)"
              >
                Submit
              </el-button>
              <el-button
                type="danger"
                link
                :disabled="row.status === 'processing'"
                @click="handleDelete(row)"
              >
                Delete
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-pager">
        <el-config-provider :locale="en">
          <el-pagination
            v-model:current-page="query.page"
            v-model:page-size="query.pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="loadData"
            @size-change="handleSizeChange"
          />
        </el-config-provider>
      </div>
    </section>

    <input
      ref="oirInputRef"
      type="file"
      accept=".oir"
      class="hidden-input"
      @change="handleOirSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import en from 'element-plus/es/locale/lang/en'
import type { ProteinImageConf } from '@/types/api'
import {
  createProteinImageConf,
  deleteProteinImageConf,
  getProteinImageConfPage,
  submitProteinImageConf,
  uploadProteinImageOir
} from '@/service/api/proteinImageConf'
import { toast } from '@/utils/tools'

defineOptions({
  name: 'ProteinImageSubmitIndex'
})

const methodOptions = [
  { label: 'Maternal', value: 'maternal' },
  { label: 'Paternal', value: 'paternal' }
]

const stageOptions = [
  { label: 'Zygote', value: 'zygote' },
  { label: '2-cell', value: '2-cell' },
  { label: '4-cell', value: '4-cell' },
  { label: '8-cell', value: '8-cell' },
  { label: 'Morula', value: 'morula' },
  { label: 'Blastocyst', value: 'blastocyst' }
]

const methodLabel = (value?: string) =>
  methodOptions.find((item) => item.value === value)?.label || value || '-'

const stageLabel = (value?: string) =>
  stageOptions.find((item) => item.value === value)?.label || value || '-'

const statusLabel = (status?: string) => {
  const map: Record<string, string> = {
    pending: 'Pending',
    uploaded: 'Uploaded',
    processing: 'Processing',
    success: 'Success',
    failed: 'Failed'
  }
  return map[status || ''] || status || '-'
}

const statusTag = (status?: string) => {
  const map: Record<string, 'info' | 'warning' | 'primary' | 'success' | 'danger'> = {
    pending: 'info',
    uploaded: 'warning',
    processing: 'primary',
    success: 'success',
    failed: 'danger'
  }
  return map[status || ''] || 'info'
}

const loading = ref(false)
const creating = ref(false)
const uploadingId = ref<number | null>(null)
const submittingId = ref<number | null>(null)
const total = ref(0)
const tableData = ref<ProteinImageConf[]>([])
const oirInputRef = ref<HTMLInputElement>()
const currentUploadRow = ref<ProteinImageConf>()
let pollTimer: ReturnType<typeof setInterval> | null = null

const query = reactive({
  page: 1,
  pageSize: 10
})

const form = reactive({
  protein: '',
  gene: '',
  ensembleId: '',
  method: '',
  location: '',
  detection: false,
  stage: '',
  imageDir: ''
})

const hasProcessing = computed(() => tableData.value.some((item) => item.status === 'processing'))

const oirLabel = (row: ProteinImageConf) => {
  if (!row.oirFile) {
    return 'Upload OIR'
  }
  const parts = row.oirFile.split(/[/\\]/)
  return parts[parts.length - 1] || row.oirFile
}

const canSubmit = (row: ProteinImageConf) =>
  (row.status === 'uploaded' || row.status === 'failed') && Boolean(row.oirFile)

const loadData = async () => {
  loading.value = true
  try {
    const res = await getProteinImageConfPage({ ...query })
    tableData.value = res.data?.list || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

const handleSizeChange = () => {
  query.page = 1
  loadData()
}

const handleGenerate = async () => {
  if (!form.protein.trim() || !form.gene.trim() || !form.ensembleId.trim()) {
    toast('Please fill protein, gene and Ensemble ID', 'warning')
    return
  }
  if (!form.method || !form.stage || !form.imageDir.trim()) {
    toast('Please fill method, stage and image dir', 'warning')
    return
  }
  creating.value = true
  try {
    await createProteinImageConf({
      protein: form.protein.trim(),
      gene: form.gene.trim(),
      ensembleId: form.ensembleId.trim(),
      method: form.method,
      location: form.location.trim() || undefined,
      detection: !!form.detection,
      stage: form.stage,
      imageDir: form.imageDir.trim()
    })
    toast('Record generated')
    query.page = 1
    await loadData()
  } finally {
    creating.value = false
  }
}

const triggerUpload = (row: ProteinImageConf) => {
  currentUploadRow.value = row
  if (oirInputRef.value) {
    oirInputRef.value.value = ''
    oirInputRef.value.click()
  }
}

const handleOirSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  const row = currentUploadRow.value
  if (!file || !row) {
    return
  }
  if (!file.name.toLowerCase().endsWith('.oir')) {
    toast('Please select an .oir file', 'warning')
    return
  }
  uploadingId.value = row.id
  try {
    await uploadProteinImageOir(row.id, file)
    toast('OIR file saved')
    await loadData()
  } finally {
    uploadingId.value = null
    currentUploadRow.value = undefined
  }
}

const handleSubmit = async (row: ProteinImageConf) => {
  submittingId.value = row.id
  try {
    await submitProteinImageConf(row.id)
    toast('Processing started')
    await loadData()
  } finally {
    submittingId.value = null
  }
}

const handleDelete = async (row: ProteinImageConf) => {
  try {
    await ElMessageBox.confirm(`Delete submit record for gene ${row.gene}?`, 'Confirm', {
      type: 'warning',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    })
  } catch {
    return
  }
  await deleteProteinImageConf(row.id)
  toast('Deleted successfully')
  if (tableData.value.length === 1 && query.page > 1) {
    query.page -= 1
  }
  loadData()
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

const startPolling = () => {
  stopPolling()
  pollTimer = setInterval(() => {
    if (hasProcessing.value) {
      loadData()
    }
  }, 3000)
}

onMounted(() => {
  loadData()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.submit-page {
  min-height: 100%;
  padding: 8px 28px 28px;
  background: linear-gradient(180deg, #f6f7fb 0%, #f3f4f8 100%);
}

.page-head {
  margin-bottom: 18px;
}

.page-head h2 {
  margin: 0;
  color: #1d2129;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.panel {
  background: #fff;
  border: 1px solid rgba(29, 33, 41, 0.06);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.filter-panel {
  padding: 20px 20px 4px;
  margin-bottom: 16px;
}

.filter-panel :deep(.fi > label) {
  color: #4e5969;
  font-size: 14px;
}

.filter-panel :deep(.admin-filter .fi .el-input__wrapper),
.filter-panel :deep(.admin-filter .fi .el-select__wrapper) {
  height: 36px;
  padding: 1px 12px;
  background: #fff;
  border-radius: 4px;
  box-shadow: none;
  border: 1px solid #e5e6eb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-panel :deep(.admin-filter .fi .el-input__wrapper:hover),
.filter-panel :deep(.admin-filter .fi .el-select__wrapper:hover) {
  background: #fff;
  border-color: #c9cdd4;
  box-shadow: none;
}

.filter-panel :deep(.admin-filter .fi .el-input__wrapper.is-focus),
.filter-panel :deep(.admin-filter .fi .el-select__wrapper.is-focused) {
  background: #fff;
  border-color: #165dff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.12);
}

.filter-panel :deep(.el-input__inner) {
  height: 34px;
  font-size: 14px;
  color: #1d2129;
}

.filter-panel :deep(.el-input__inner::placeholder) {
  color: #c9cdd4;
}

.filter-panel :deep(.el-select) {
  flex: 1;
  min-width: 0;
}

.filter-panel :deep(.fi.wide) {
  width: 50%;
}

.filter-panel :deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}

.table-panel {
  overflow: hidden;
}

.data-table {
  width: 100%;
  --el-table-header-bg-color: #fafbfc;
  --el-table-header-text-color: #86909c;
  --el-table-text-color: #1d2129;
  --el-table-border-color: #f2f3f5;
  --el-table-row-hover-bg-color: #f7f8fa;
}

.data-table :deep(th.el-table__cell) {
  height: 48px;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.data-table :deep(td.el-table__cell) {
  height: 56px;
  font-size: 15px;
}

.data-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.oir-link {
  padding: 0;
  border: none;
  background: none;
  color: #165dff;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
}

.oir-link:disabled {
  color: #86909c;
  cursor: not-allowed;
}

.hidden-input {
  display: none;
}

.table-actions :deep(.el-button) {
  opacity: 0.72;
}

.table-actions :deep(.el-button:hover) {
  opacity: 1;
}

.table-pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px 16px;
  border-top: 1px solid #f2f3f5;
}

.table-pager :deep(.el-pagination) {
  font-size: 14px;
}

.table-pager :deep(.el-pagination__total),
.table-pager :deep(.el-pagination__jump) {
  font-size: 14px;
  color: #4e5969;
}

.table-pager :deep(.el-pagination__sizes .el-select) {
  width: 118px;
}

.table-pager :deep(.el-pagination__sizes .el-select__wrapper),
.table-pager :deep(.el-pagination__sizes .el-select .el-select__selected-item),
.table-pager :deep(.el-pagination__sizes .el-input__inner),
.table-pager :deep(.el-pagination__sizes .el-select__placeholder) {
  font-size: 15px !important;
  color: #1d2129;
}

.table-pager :deep(.el-pager li.is-active) {
  border-radius: 6px;
  color: #fff !important;
}

@media (max-width: 1200px) {
  .filter-panel :deep(.fi.wide) {
    width: 100%;
  }
}
</style>
