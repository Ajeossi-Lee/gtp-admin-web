<template>
  <div class="protein-images-page">
    <section class="panel filter-panel">
      <div class="admin-filter">
        <div class="fi">
          <label>Gene</label>
          <el-input v-model="query.gene" placeholder="Enter gene name" clearable @keyup.enter="handleSearch" />
        </div>
        <div class="fi">
          <label>Protein</label>
          <el-input v-model="query.protein" placeholder="Enter protein name" clearable @keyup.enter="handleSearch" />
        </div>
        <div class="fi">
          <label>Ensemble ID</label>
          <el-input v-model="query.ensembleId" placeholder="Enter Ensemble ID" clearable @keyup.enter="handleSearch" />
        </div>
        <div class="fi">
          <label>Method</label>
          <el-select v-model="query.method" placeholder="Select method" clearable>
            <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="fi">
          <label>Stage</label>
          <el-select v-model="query.stage" placeholder="Select stage" clearable>
            <el-option v-for="item in stageOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="fi">
          <label>Location</label>
          <el-select v-model="query.location" placeholder="Select location" clearable>
            <el-option v-for="item in locationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="fi btns">
          <el-button type="primary" @click="handleSearch">
            <IconSearch theme="outline" size="14" fill="currentColor" />
            Search
          </el-button>
          <el-button @click="handleReset">
            <IconRedo theme="outline" size="14" fill="currentColor" />
            Reset
          </el-button>
        </div>
      </div>
    </section>

    <section class="panel table-panel">
      <div class="table-toolbar">
        <h2 class="table-title">Protein Images</h2>
      </div>
      <el-table v-loading="loading" :data="tableData" border class="data-table">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="gene" label="Gene" min-width="120" align="center" show-overflow-tooltip />
        <el-table-column prop="protein" label="Protein" min-width="120" align="center" show-overflow-tooltip />
        <el-table-column prop="ensembleId" label="Ensemble ID" min-width="150" align="center" show-overflow-tooltip />
        <el-table-column prop="method" label="Method" width="120" align="center">
          <template #default="{ row }">
            {{ methodLabel(row.method) }}
          </template>
        </el-table-column>
        <el-table-column prop="stage" label="Stage" width="130" align="center">
          <template #default="{ row }">
            {{ stageLabel(row.stage) }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="Location" min-width="120" align="center" show-overflow-tooltip />
        <el-table-column prop="detection" label="Detected" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.detection ? 'success' : 'info'" size="small">
              {{ row.detection ? 'Yes' : 'No' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="imageDir" label="Image directory" min-width="180" align="center" show-overflow-tooltip />
        <el-table-column prop="slicePixels" label="Slice pixels" width="120" align="center">
          <template #default="{ row }">
            {{ row.slicePixels ?? '' }}
          </template>
        </el-table-column>
        <el-table-column prop="zstackStep" label="Z-stack step" width="130" align="center">
          <template #default="{ row }">
            {{ row.zstackStep ?? '' }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="90" fixed="right" align="center">
          <template #default="{ row }">
            <div class="table-actions">
              <el-tooltip content="Edit" placement="top">
                <el-button type="primary" link @click="openDialog(row)">
                  <IconEdit theme="outline" size="16" fill="currentColor" />
                </el-button>
              </el-tooltip>
              <el-tooltip content="Delete" placement="top">
                <el-button type="danger" link @click="handleDelete(row)">
                  <IconDelete theme="outline" size="16" fill="currentColor" />
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-pager">
        <el-config-provider :locale="en">
          <el-pagination v-model:current-page="query.page" v-model:page-size="query.pageSize" :total="total"
            :page-sizes="[10, 20, 50, 100]" layout="total, prev, pager, next, sizes" @current-change="loadData"
            @size-change="handleSizeChange" />
        </el-config-provider>
      </div>
    </section>

    <el-dialog v-model="dialogVisible" title="Edit Protein Image" width="720px" destroy-on-close
      class="protein-images-dialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="Gene" prop="gene">
          <el-input v-model="form.gene" maxlength="100" />
        </el-form-item>
        <el-form-item label="Protein" prop="protein">
          <el-input v-model="form.protein" maxlength="100" />
        </el-form-item>
        <el-form-item label="Ensemble ID" prop="ensembleId">
          <el-input v-model="form.ensembleId" maxlength="100" />
        </el-form-item>
        <el-form-item label="Method" prop="method">
          <el-select v-model="form.method" placeholder="Select method">
            <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Stage" prop="stage">
          <el-select v-model="form.stage" placeholder="Select stage">
            <el-option v-for="item in stageOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Location" prop="location">
          <el-input v-model="form.location" maxlength="100" />
        </el-form-item>
        <el-form-item label="Detected" prop="detection">
          <el-switch v-model="form.detection" />
        </el-form-item>
        <el-form-item label="Image directory" prop="imageDir">
          <el-input v-model="form.imageDir" maxlength="500" />
        </el-form-item>
        <el-form-item label="Slice pixels" prop="slicePixels">
          <el-input-number
            v-model="form.slicePixels"
            :min="0.01"
            :precision="2"
            :step="0.1"
            :value-on-clear="null"
            controls-position="right"
            placeholder="e.g. 5.6"
          />
        </el-form-item>
        <el-form-item label="Z-stack step (µm)" prop="zstackStep">
          <el-input-number
            v-model="form.zstackStep"
            :min="0.01"
            :precision="2"
            :step="0.1"
            :value-on-clear="null"
            controls-position="right"
            placeholder="e.g. 1.4"
          />
        </el-form-item>
        <el-form-item label="Channel 1 Max" prop="channel1MaxName">
          <el-input v-model="form.channel1MaxName" maxlength="500" />
        </el-form-item>
        <el-form-item label="Channel 2 Max" prop="channel2MaxName">
          <el-input v-model="form.channel2MaxName" maxlength="500" />
        </el-form-item>
        <el-form-item label="Merged Max" prop="mergedMaxName">
          <el-input v-model="form.mergedMaxName" maxlength="500" />
        </el-form-item>
        <el-form-item label="Channel 1 Video" prop="channel1VideoName">
          <el-input v-model="form.channel1VideoName" maxlength="500" />
        </el-form-item>
        <el-form-item label="Channel 2 Video" prop="channel2VideoName">
          <el-input v-model="form.channel2VideoName" maxlength="500" />
        </el-form-item>
        <el-form-item label="Merged Video" prop="mergedVideoName">
          <el-input v-model="form.mergedVideoName" maxlength="500" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import en from 'element-plus/es/locale/lang/en'
import type { ProteinImages } from '@/types/api'
import {
  deleteProteinImages,
  getProteinImagesPage,
  updateProteinImages
} from '@/service/api/proteinImages'
import { toast } from '@/utils/tools'
import {
  Delete as IconDelete,
  Edit as IconEdit,
  Redo as IconRedo,
  Search as IconSearch
} from '@icon-park/vue-next'
import '@icon-park/vue-next/styles/index.css'

defineOptions({
  name: 'ProteinImagesIndex'
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

/** 下拉中的 Null 表示空值，不写入这个字面量 */
const LOCATION_NULL = '__NULL__'

const locationOptions = [
  { label: 'Null', value: LOCATION_NULL },
  { label: 'Cytoplasm', value: 'Cytoplasm' },
  { label: 'Cytoplasm & Nucleus', value: 'Cytoplasm & Nucleus' },
  { label: 'Membrane', value: 'Membrane' },
  { label: 'Nucleus', value: 'Nucleus' },
  { label: 'Nucleus_Foci', value: 'Nucleus_Foci' }
]

const methodLabel = (value?: string) =>
  methodOptions.find((item) => item.value === value)?.label || value || '-'

const stageLabel = (value?: string) =>
  stageOptions.find((item) => item.value === value)?.label || value || '-'

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const total = ref(0)
const tableData = ref<ProteinImages[]>([])
const formRef = ref<FormInstance>()

const query = reactive({
  page: 1,
  pageSize: 10,
  gene: '',
  protein: '',
  ensembleId: '',
  method: '',
  stage: '',
  location: ''
})

const emptyForm = (): ProteinImages => ({
  id: 0,
  protein: '',
  gene: '',
  ensembleId: '',
  method: '',
  location: '',
  detection: false,
  stage: '',
  imageDir: '',
  slicePixels: null,
  zstackStep: null,
  channel1MaxName: '',
  channel2MaxName: '',
  mergedMaxName: '',
  channel1VideoName: '',
  channel2VideoName: '',
  mergedVideoName: ''
})

const form = reactive<ProteinImages>(emptyForm())

const rules: FormRules = {
  gene: [{ required: true, message: 'Please enter gene name', trigger: 'blur' }],
  protein: [{ required: true, message: 'Please enter protein name', trigger: 'blur' }],
  ensembleId: [{ required: true, message: 'Please enter Ensemble ID', trigger: 'blur' }],
  method: [{ required: true, message: 'Please select method', trigger: 'change' }],
  stage: [{ required: true, message: 'Please select stage', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getProteinImagesPage({ ...query })
    tableData.value = res.data?.list || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  query.page = 1
  loadData()
}

const handleReset = () => {
  query.gene = ''
  query.protein = ''
  query.ensembleId = ''
  query.method = ''
  query.stage = ''
  query.location = ''
  handleSearch()
}

const handleSizeChange = () => {
  query.page = 1
  loadData()
}

const assignForm = (row: ProteinImages) => {
  Object.assign(form, emptyForm(), row, {
    detection: !!row.detection
  })
}

const openDialog = (row: ProteinImages) => {
  assignForm(row)
  dialogVisible.value = true
}

const handleSave = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || !form.id) {
    return
  }
  saving.value = true
  try {
    const payload = {
      protein: form.protein.trim(),
      gene: form.gene.trim(),
      ensembleId: form.ensembleId.trim(),
      method: form.method,
      stage: form.stage,
      location: form.location?.trim() || undefined,
      detection: !!form.detection,
      imageDir: form.imageDir?.trim() || undefined,
      slicePixels: form.slicePixels ?? null,
      zstackStep: form.zstackStep ?? null,
      channel1MaxName: form.channel1MaxName?.trim() || undefined,
      channel2MaxName: form.channel2MaxName?.trim() || undefined,
      mergedMaxName: form.mergedMaxName?.trim() || undefined,
      channel1VideoName: form.channel1VideoName?.trim() || undefined,
      channel2VideoName: form.channel2VideoName?.trim() || undefined,
      mergedVideoName: form.mergedVideoName?.trim() || undefined
    }
    await updateProteinImages(form.id, payload)
    toast('Updated successfully')
    dialogVisible.value = false
    loadData()
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row: ProteinImages) => {
  try {
    await ElMessageBox.confirm(
      `Delete protein image record for gene ${row.gene}? Related image slices will also be deleted.`,
      'Confirm',
      {
        type: 'warning',
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel'
      }
    )
  } catch {
    return
  }
  await deleteProteinImages(row.id)
  toast('Deleted successfully')
  if (tableData.value.length === 1 && query.page > 1) {
    query.page -= 1
  }
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.protein-images-page {
  min-height: 100%;
  padding: 8px 28px 28px;
  background: linear-gradient(180deg, #f6f7fb 0%, #f3f4f8 100%);
}

.panel {
  background: #fff;
  border: 1px solid rgba(29, 33, 41, 0.06);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.filter-panel {
  padding: 20px 20px 8px;
  margin-bottom: 16px;
}

.filter-panel :deep(.admin-filter) {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 16px;
  row-gap: 12px;
  align-items: center;
}

.filter-panel :deep(.admin-filter .fi) {
  width: auto;
  min-width: 0;
  margin-bottom: 0;
  padding-right: 0;
}

.filter-panel :deep(.admin-filter .fi.btns) {
  grid-column: 3 / 5;
  width: auto;
  min-width: 0;
  margin-bottom: 0;
  padding-right: 0;
  justify-content: flex-end;
}

.filter-panel :deep(.fi > label) {
  width: auto;
  color: #4e5969;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
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
  width: 100%;
  min-width: 0;
}

:deep(.el-dialog .el-select),
:deep(.el-dialog .el-input-number) {
  width: 100%;
}

.filter-panel :deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}

.filter-panel :deep(.el-button:not(.el-button--primary)) {
  color: #4e5969;
  background: #fff;
  border-color: #e5e6eb;
}

.filter-panel :deep(.fi.btns .el-button > span) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.filter-panel :deep(.fi.btns .el-button .i-icon) {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

.filter-panel :deep(.fi.btns .el-button .i-icon svg) {
  display: block;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 56px;
  padding: 12px 20px;
  border-bottom: 1px solid #f2f3f5;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #1d2129;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0.2px;
}

.table-title::before {
  content: '';
  width: 3px;
  height: 16px;
  border-radius: 2px;
  background: #165dff;
  flex: none;
}

.table-panel {
  overflow: hidden;
}

.data-table {
  width: 100%;
  --el-table-header-bg-color: #fafbfc;
  --el-table-header-text-color: #2e3238;
  --el-table-text-color: #4e5969;
  --el-table-border-color: #e5e6eb;
  --el-table-row-hover-bg-color: #f7f8fa;
}

.data-table :deep(th.el-table__cell) {
  height: 48px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.2px;
  text-align: center;
}

.data-table :deep(td.el-table__cell) {
  height: 56px;
  font-size: 14px;
  font-weight: 400;
  color: #4e5969;
  text-align: center;
}

.data-table :deep(td.el-table__cell .cell) {
  font-weight: 400;
  color: #4e5969;
}

.data-table :deep(td.el-table__cell .el-link) {
  font-weight: 400;
}

.data-table :deep(.el-table__inner-wrapper::before) {
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

/* 平板：筛选条件两列，按钮单独一行靠右 */
@media (max-width: 1200px) {
  .filter-panel :deep(.admin-filter) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-panel :deep(.admin-filter .fi.btns) {
    grid-column: 1 / -1;
    justify-content: flex-end;
  }
}

/* 手机：筛选条件纵向排列，按钮仍靠右 */
@media (max-width: 768px) {
  .protein-images-page {
    padding: 4px 12px 16px;
  }

  .filter-panel {
    padding: 14px 12px 12px;
  }

  .filter-panel :deep(.admin-filter) {
    grid-template-columns: minmax(0, 1fr);
  }

  .filter-panel :deep(.admin-filter .fi.btns) {
    grid-column: auto;
    justify-content: flex-end;
  }

  .table-toolbar {
    padding: 12px;
  }

  .table-pager {
    justify-content: center;
    padding: 12px;
    overflow-x: auto;
  }

  .table-pager :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 8px;
  }
}
</style>

<style>
/* 弹窗挂到 body，需用非 scoped 样式覆盖宽度 */
@media (max-width: 768px) {
  .protein-images-dialog.el-dialog {
    width: calc(100vw - 24px) !important;
    max-width: calc(100vw - 24px);
  }

  .protein-images-dialog .el-dialog__body {
    max-height: 70vh;
    overflow: auto;
  }

  .protein-images-dialog .el-form-item__label {
    width: auto !important;
    height: auto;
    justify-content: flex-start;
    line-height: 22px;
  }

  .protein-images-dialog .el-form-item__content {
    margin-left: 0 !important;
  }

  .protein-images-dialog .el-input-number {
    width: 100%;
  }
}
</style>
