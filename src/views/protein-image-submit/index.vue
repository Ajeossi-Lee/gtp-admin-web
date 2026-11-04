<template>
  <div class="submit-page">
    <section class="panel filter-panel">
      <div class="admin-filter">
        <div class="fi">
          <label>Protein</label>
          <el-input v-model="query.protein" placeholder="Enter protein name" maxlength="100" clearable
            @keyup.enter="handleSearch" />
        </div>
        <div class="fi">
          <label>Gene</label>
          <el-input v-model="query.gene" placeholder="Enter gene name" maxlength="100" clearable
            @keyup.enter="handleSearch" />
        </div>
        <div class="fi">
          <label>Ensemble ID</label>
          <el-input v-model="query.ensembleId" placeholder="Enter Ensemble ID" maxlength="100" clearable
            @keyup.enter="handleSearch" />
        </div>
        <div class="fi">
          <label>Created at</label>
          <el-date-picker v-model="createdAtRange" type="daterange" value-format="YYYY-MM-DD" range-separator="-"
            start-placeholder="Start date" end-placeholder="End date" clearable />
        </div>
        <div class="fi">
          <label>Location</label>
          <el-select v-model="query.location" placeholder="Select location" clearable>
            <el-option v-for="item in locationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="fi">
          <label>Status</label>
          <el-select v-model="query.status" placeholder="Select status" clearable>
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
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
        <h2 class="table-title">Submit Images</h2>
        <el-button type="primary" @click="openDialog">
          <IconPlus theme="outline" size="14" fill="currentColor" />
          Add
        </el-button>
      </div>
      <el-table v-loading="loading" :data="tableData" border class="data-table">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column label="OIR file" min-width="180" align="center">
          <template #default="{ row }">
            <div class="oir-cell">
              <el-tooltip v-if="!oirFileName(row.oirFile)" content="upload oir file" placement="top">
                <span class="oir-tip">
                  <el-button type="primary" link class="oir-upload-btn"
                    :disabled="row.status === 'processing' || uploadingId === row.id" :loading="uploadingId === row.id"
                    @click="openUploadDialog(row)">
                    <IconUpload v-if="uploadingId !== row.id" theme="outline" size="16" fill="currentColor" />
                  </el-button>
                </span>
              </el-tooltip>
              <el-tooltip v-else content="upload oir file" placement="top">
                <button type="button" class="oir-name" :disabled="row.status === 'processing' || uploadingId === row.id"
                  @click="openUploadDialog(row)">
                  {{ uploadingId === row.id ? 'Uploading...' : oirFileName(row.oirFile) }}
                </button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created at" min-width="170" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatCreatedAt(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120" align="center">
          <template #default="{ row }">
            <el-tooltip v-if="row.status === 'failed' && row.errorMessage" :content="row.errorMessage" placement="top">
              <el-tag :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
            </el-tooltip>
            <el-tag v-else :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="protein" label="Protein" min-width="110" align="center" show-overflow-tooltip />
        <el-table-column prop="gene" label="Gene" min-width="110" align="center" show-overflow-tooltip />
        <el-table-column prop="ensembleId" label="Ensemble ID" min-width="150" align="center" show-overflow-tooltip />
        <el-table-column prop="stage" label="Stage" width="110" align="center">
          <template #default="{ row }">
            {{ stageLabel(row.stage) }}
          </template>
        </el-table-column>
        <el-table-column prop="method" label="Method" width="110" align="center">
          <template #default="{ row }">
            {{ methodLabel(row.method) }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="Location" min-width="180" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.location || 'Null' }}
          </template>
        </el-table-column>
        <el-table-column prop="detection" label="Detected" width="100" align="center">
          <template #default="{ row }">
            {{ row.detection ? 'TRUE' : 'FALSE' }}
          </template>
        </el-table-column>
        <el-table-column prop="imageDir" label="Image dir" min-width="160" align="center" show-overflow-tooltip />
        <el-table-column label="Actions" width="90" fixed="right" align="center">
          <template #default="{ row }">
            <div class="table-actions">
              <el-tooltip content="Submit" placement="top">
                <span class="action-tip">
                  <el-button type="primary" link class="submit-btn"
                    :class="{ 'is-muted': isSubmitMuted(row) }"
                    :disabled="!canSubmit(row) || submittingId === row.id"
                    :loading="submittingId === row.id" @click="handleSubmit(row)">
                    <IconHandleRight theme="outline" size="16" fill="currentColor" />
                  </el-button>
                </span>
              </el-tooltip>
              <el-tooltip content="Delete" placement="top">
                <span class="action-tip">
                  <el-button type="danger" link :disabled="row.status === 'processing'" @click="handleDelete(row)">
                    <IconDelete theme="outline" size="16" fill="currentColor" />
                  </el-button>
                </span>
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

    <el-dialog v-model="dialogVisible" title="Add" width="720px" destroy-on-close class="submit-dialog"
      :close-on-click-modal="!creating && !importing" :close-on-press-escape="!creating && !importing"
      :show-close="!creating && !importing" @closed="resetForm">
      <el-tabs v-model="addTab" class="add-tabs">
        <el-tab-pane label="Single submit" name="single" :disabled="creating || importing">
          <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
            <el-form-item label="Protein" prop="protein">
              <el-input v-model="form.protein" placeholder="Enter protein name" maxlength="100" />
            </el-form-item>
            <el-form-item label="Gene" prop="gene">
              <el-input v-model="form.gene" placeholder="Enter gene name" maxlength="100" />
            </el-form-item>
            <el-form-item label="Ensemble ID" prop="ensembleId">
              <el-input v-model="form.ensembleId" placeholder="Enter Ensemble ID" maxlength="100" />
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
              <el-select v-model="form.location" placeholder="Select location" clearable>
                <el-option v-for="item in locationOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Detected" prop="detection">
              <el-switch v-model="form.detection" />
            </el-form-item>
            <el-form-item label="Image dir" prop="imageDir">
              <el-input v-model="form.imageDir" placeholder="e.g. Atad2 oocyte ICSI 2-cell_A" maxlength="500" />
            </el-form-item>
            <el-form-item label="OIR file">
              <el-upload ref="addUploadRef" class="oir-upload" drag :auto-upload="false" :limit="1" accept=".oir"
                :disabled="creating" :on-change="onAddOirChange" :on-remove="onAddOirRemove"
                :on-exceed="onAddOirExceed">
                <el-icon class="el-icon--upload">
                  <UploadFilled />
                </el-icon>
                <div class="el-upload__text">Drop .oir file here, or <em>click to select</em></div>
              </el-upload>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="Batch submit" name="batch" :disabled="creating || importing">
          <div class="batch-pane">
            <p class="batch-hint">
              Upload a conf.csv file.
            </p>
            <el-upload ref="csvUploadRef" class="oir-upload" drag :auto-upload="false" :limit="1" accept=".csv"
              :disabled="importing" :on-change="onCsvChange" :on-remove="onCsvRemove" :on-exceed="onCsvExceed">
              <el-icon class="el-icon--upload">
                <UploadFilled />
              </el-icon>
              <div class="el-upload__text">Drop CSV file here, or <em>click to select</em></div>
            </el-upload>
            <div v-if="importErrors.length" class="batch-error-panel">
              <p class="batch-error-title">Import rejected. No records were saved.</p>
              <ul>
                <li v-for="(item, index) in importErrors" :key="`${item.row}-${item.field}-${index}`">
                  <span class="row">Row {{ item.row }}</span>
                  <span class="field">{{ item.field }}</span>
                  <span class="msg">{{ item.message }}</span>
                </li>
              </ul>
            </div>
            <div class="batch-rules">
              <p><strong>Required columns</strong></p>
              <p>protein, gene, ensemble_id, method, location, detection, stage, image_dir</p>
              <p><strong>Allowed values</strong></p>
              <p>ensemble_id starts with ENSMUSG</p>
              <p>method: maternal, paternal</p>
              <p>location: empty, or Cytoplasm, Cytoplasm &amp; Nucleus, Membrane, Nucleus, Nucleus_Foci</p>
              <p>detection: TRUE, FALSE</p>
              <p>stage: zygote, 2-cell, 4-cell, 8-cell, blastocyst, morula</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button :disabled="creating || importing" @click="dialogVisible = false">Cancel</el-button>
        <el-button v-if="addTab === 'single'" type="primary" :loading="creating" @click="handleGenerate">
          Submit
        </el-button>
        <el-button v-else type="primary" :loading="importing" @click="handleBatchImport">Import</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="uploadVisible" title="Upload OIR" width="560px" class="submit-dialog"
      :close-on-click-modal="uploadingId === null" :close-on-press-escape="uploadingId === null"
      :show-close="uploadingId === null" @closed="resetUpload">
      <div class="upload-summary">
        <span>Protein</span>
        <strong>{{ currentUploadRow?.protein || '-' }}</strong>
        <span>Gene</span>
        <strong>{{ currentUploadRow?.gene || '-' }}</strong>
        <span>Method</span>
        <strong>{{ methodLabel(currentUploadRow?.method) }}</strong>
        <span>Stage</span>
        <strong>{{ stageLabel(currentUploadRow?.stage) }}</strong>
        <span>Current file</span>
        <strong>{{ currentOirName || 'Not uploaded' }}</strong>
      </div>
      <el-upload ref="rowUploadRef" class="oir-upload" drag :auto-upload="false" :limit="1" accept=".oir"
        :disabled="uploadingId !== null" :on-change="onRowOirChange" :on-remove="onRowOirRemove"
        :on-exceed="onRowOirExceed">
        <el-icon class="el-icon--upload">
          <UploadFilled />
        </el-icon>
        <div class="el-upload__text">Drop .oir file here, or <em>click to select</em></div>
      </el-upload>
      <template #footer>
        <el-button :disabled="uploadingId !== null" @click="uploadVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="uploadingId !== null" @click="handleUploadConfirm">Upload</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules, UploadFile, UploadInstance, UploadRawFile } from 'element-plus'
import { ElMessageBox, ElNotification, genFileId } from 'element-plus'
import en from 'element-plus/es/locale/lang/en'
import dayjs from 'dayjs'
import type { ProteinImageConf } from '@/types/api'
import {
  createProteinImageConf,
  deleteProteinImageConf,
  getProteinImageConfPage,
  importProteinImageConfCsv,
  submitProteinImageConf,
  uploadProteinImageOir
} from '@/service/api/proteinImageConf'
import type { ProteinImageConfImportError } from '@/service/api/proteinImageConf'
import { toast } from '@/utils/tools'
import { UploadFilled } from '@element-plus/icons-vue'
import {
  Delete as IconDelete,
  Plus as IconPlus,
  Redo as IconRedo,
  Search as IconSearch,
  HandleRight as IconHandleRight,
  UploadOne as IconUpload
} from '@icon-park/vue-next'
import '@icon-park/vue-next/styles/index.css'

defineOptions({
  name: 'ProteinImageSubmitIndex'
})

const methodOptions = [
  { label: 'Maternal', value: 'maternal' },
  { label: 'Paternal', value: 'paternal' }
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

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Uploaded', value: 'uploaded' },
  { label: 'Processing', value: 'processing' },
  { label: 'Success', value: 'success' },
  { label: 'Failed', value: 'failed' }
]

const statusLabel = (status?: string) =>
  statusOptions.find((item) => item.value === status)?.label || status || '-'

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
const importing = ref(false)
const addTab = ref<'single' | 'batch'>('single')
const dialogVisible = ref(false)
const uploadVisible = ref(false)
const uploadingId = ref<number | null>(null)
const selectedOirFile = ref<File>()
const addOirFile = ref<File>()
const csvFile = ref<File>()
const importErrors = ref<ProteinImageConfImportError[]>([])
const addUploadRef = ref<UploadInstance>()
const csvUploadRef = ref<UploadInstance>()
const rowUploadRef = ref<UploadInstance>()
const submittingId = ref<number | null>(null)
const total = ref(0)
const tableData = ref<ProteinImageConf[]>([])
const formRef = ref<FormInstance>()
const currentUploadRow = ref<ProteinImageConf>()
const createdAtRange = ref<string[] | null>(null)
let pollTimer: ReturnType<typeof setInterval> | null = null

const query = reactive({
  page: 1,
  pageSize: 10,
  protein: '',
  gene: '',
  ensembleId: '',
  location: '',
  status: '',
  createdAtStart: '',
  createdAtEnd: ''
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

const rules: FormRules = {
  protein: [{ required: true, message: 'Please enter protein name', trigger: 'blur' }],
  gene: [{ required: true, message: 'Please enter gene name', trigger: 'blur' }],
  ensembleId: [{ required: true, message: 'Please enter Ensemble ID', trigger: 'blur' }],
  method: [{ required: true, message: 'Please select method', trigger: 'change' }],
  stage: [{ required: true, message: 'Please select stage', trigger: 'change' }],
  imageDir: [{ required: true, message: 'Please enter image dir', trigger: 'blur' }]
}

const hasProcessing = computed(() => tableData.value.some((item) => item.status === 'processing'))

const oirFileName = (oirFile?: string) => {
  if (!oirFile) {
    return ''
  }
  const parts = oirFile.split(/[/\\]/)
  return parts[parts.length - 1] || oirFile
}

const currentOirName = computed(() => oirFileName(currentUploadRow.value?.oirFile))

/** 只接收 .oir；拖入其他文件时清空并提示 */
const takeOirFile = (uploadFile: UploadFile, target: { value?: File }, uploadRef?: UploadInstance) => {
  const raw = uploadFile.raw
  if (!raw) {
    return
  }
  if (!raw.name.toLowerCase().endsWith('.oir')) {
    target.value = undefined
    uploadRef?.clearFiles()
    toast('Please select an .oir file', 'warning')
    return
  }
  target.value = raw
}

/** 已有一个文件时再拖入，替换成最新的那个 */
const replaceOirFile = (files: File[], uploadRef?: UploadInstance) => {
  const file = files[0] as UploadRawFile | undefined
  if (!file || !uploadRef) {
    return
  }
  uploadRef.clearFiles()
  file.uid = genFileId()
  uploadRef.handleStart(file)
}

const canSubmit = (row: ProteinImageConf) =>
  (row.status === 'uploaded' || row.status === 'failed') && Boolean(row.oirFile)

/** processing、success 时提交按钮置灰 */
const isSubmitMuted = (row: ProteinImageConf) =>
  row.status === 'processing' || row.status === 'process' || row.status === 'success'

const formatCreatedAt = (value?: string) => {
  if (!value) {
    return '-'
  }
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : value
}

/** 把日期范围写回查询条件，开始和结束都包含当天 */
const syncCreatedAt = () => {
  query.createdAtStart = createdAtRange.value?.[0] || ''
  query.createdAtEnd = createdAtRange.value?.[1] || ''
}

const loadData = async () => {
  syncCreatedAt()
  loading.value = true
  try {
    const res = await getProteinImageConfPage({ ...query })
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

const handleSizeChange = () => {
  query.page = 1
  loadData()
}

const handleReset = () => {
  query.protein = ''
  query.gene = ''
  query.ensembleId = ''
  query.location = ''
  query.status = ''
  query.createdAtStart = ''
  query.createdAtEnd = ''
  createdAtRange.value = null
  handleSearch()
}

const resetForm = () => {
  form.protein = ''
  form.gene = ''
  form.ensembleId = ''
  form.method = ''
  form.location = ''
  form.detection = false
  form.stage = ''
  form.imageDir = ''
  addOirFile.value = undefined
  csvFile.value = undefined
  importErrors.value = []
  addTab.value = 'single'
  addUploadRef.value?.clearFiles()
  csvUploadRef.value?.clearFiles()
  formRef.value?.clearValidate()
}

const onAddOirChange = (uploadFile: UploadFile) => {
  takeOirFile(uploadFile, addOirFile, addUploadRef.value)
}

const onAddOirRemove = () => {
  addOirFile.value = undefined
}

const onAddOirExceed = (files: File[]) => {
  replaceOirFile(files, addUploadRef.value)
}

const openDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const handleGenerate = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  creating.value = true
  const file = addOirFile.value
  let createdId: number | undefined
  try {
    const res = await createProteinImageConf({
      protein: form.protein.trim(),
      gene: form.gene.trim(),
      ensembleId: form.ensembleId.trim(),
      method: form.method,
      location: !form.location || form.location === LOCATION_NULL ? undefined : form.location,
      detection: !!form.detection,
      stage: form.stage,
      imageDir: form.imageDir.trim()
    })
    createdId = res?.data
    if (file) {
      if (!createdId) {
        throw new Error('missing id')
      }
      await uploadProteinImageOir(createdId, file)
    }
    toast(file ? 'Record generated and OIR file saved' : 'Record generated')
    dialogVisible.value = false
    query.page = 1
    await loadData()
  } catch {
    // 记录已生成但文件上传失败时，关闭弹框并刷新，方便从列表继续上传
    if (createdId) {
      dialogVisible.value = false
      query.page = 1
      await loadData()
    }
  } finally {
    creating.value = false
  }
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }
    return map[char] || char
  })

/** 兼容请求层把 CommonResult 再拆开一层的情况 */
const readImportResult = (res: {
  success?: boolean
  inserted?: number
  errors?: ProteinImageConfImportError[]
  data?: {
    success?: boolean
    inserted?: number
    errors?: ProteinImageConfImportError[]
  }
}) => {
  if (typeof res?.success === 'boolean') {
    return res
  }
  if (res?.data && typeof res.data.success === 'boolean') {
    return res.data
  }
  return undefined
}

const notifyImportErrors = (errors: ProteinImageConfImportError[]) => {
  const shown = errors.slice(0, 40)
  const hidden = errors.length - shown.length
  const items = shown
    .map(
      (item) => `<li>
        <span class="row">Row ${item.row}</span>
        <span class="field">${escapeHtml(item.field || '-')}</span>
        <span class="msg">${escapeHtml(item.message || '')}</span>
      </li>`
    )
    .join('')
  const more = hidden > 0 ? `<p class="more">${hidden} more errors are not shown</p>` : ''
  const summary = errors.length
    ? `${errors.length} check${errors.length === 1 ? '' : 's'} failed. No records were imported.`
    : 'Import was rejected. No records were imported.'
  ElNotification({
    title: 'Import failed',
    type: 'error',
    duration: 0,
    position: 'top-right',
    zIndex: 10000,
    customClass: 'batch-import-notice',
    dangerouslyUseHTMLString: true,
    message: `<p class="summary">${summary}</p>
      <ul class="batch-import-list">${items}</ul>${more}`
  })
}

const onCsvChange = (uploadFile: UploadFile) => {
  const raw = uploadFile.raw
  if (!raw) {
    return
  }
  if (!raw.name.toLowerCase().endsWith('.csv')) {
    csvFile.value = undefined
    csvUploadRef.value?.clearFiles()
    toast('Please select a .csv file', 'warning')
    return
  }
  csvFile.value = raw
  importErrors.value = []
}

const onCsvRemove = () => {
  csvFile.value = undefined
}

const onCsvExceed = (files: File[]) => {
  replaceOirFile(files, csvUploadRef.value)
}

const handleBatchImport = async () => {
  if (!csvFile.value) {
    toast('Please select a .csv file', 'warning')
    return
  }
  importing.value = true
  importErrors.value = []
  try {
    const res = await importProteinImageConfCsv(csvFile.value)
    const result = readImportResult(res)
    if (!result?.success) {
      importErrors.value = result?.errors || []
      notifyImportErrors(importErrors.value)
      return
    }
    ElNotification({
      title: 'Import completed',
      message: `${result.inserted} record${result.inserted === 1 ? '' : 's'} added`,
      type: 'success',
      duration: 4000,
      position: 'top-right',
      zIndex: 10000
    })
    dialogVisible.value = false
    query.page = 1
    await loadData()
  } catch (error: any) {
    const message = error?.message || 'Import was rejected'
    importErrors.value = [{ row: 0, field: 'file', message }]
    notifyImportErrors(importErrors.value)
  } finally {
    importing.value = false
  }
}

const resetUpload = () => {
  selectedOirFile.value = undefined
  currentUploadRow.value = undefined
  rowUploadRef.value?.clearFiles()
}

const openUploadDialog = (row: ProteinImageConf) => {
  if (row.status === 'processing') {
    return
  }
  currentUploadRow.value = row
  selectedOirFile.value = undefined
  rowUploadRef.value?.clearFiles()
  uploadVisible.value = true
}

const onRowOirChange = (uploadFile: UploadFile) => {
  takeOirFile(uploadFile, selectedOirFile, rowUploadRef.value)
}

const onRowOirRemove = () => {
  selectedOirFile.value = undefined
}

const onRowOirExceed = (files: File[]) => {
  replaceOirFile(files, rowUploadRef.value)
}

const handleUploadConfirm = async () => {
  const file = selectedOirFile.value
  const row = currentUploadRow.value
  if (!file || !row) {
    toast('Please select an .oir file', 'warning')
    return
  }
  uploadingId.value = row.id
  try {
    await uploadProteinImageOir(row.id, file)
    toast('OIR file saved')
    uploadVisible.value = false
    await loadData()
  } finally {
    uploadingId.value = null
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
  }, 10000)
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
  grid-column: 1 / -1;
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

.filter-panel :deep(.el-select),
.filter-panel :deep(.el-date-editor) {
  flex: 1;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.filter-panel :deep(.el-range-input) {
  font-size: 14px;
  color: #1d2129;
}

.filter-panel :deep(.el-range-input::placeholder) {
  color: #c9cdd4;
}

:deep(.submit-dialog .el-select) {
  width: 100%;
}

:deep(.submit-dialog .el-dialog__body),
:deep(.submit-dialog .el-dialog__footer) {
  padding-right: 32px;
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

.table-toolbar :deep(.el-button) {
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;
  font-weight: 500;
}

.table-toolbar :deep(.el-button > span) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.table-toolbar :deep(.el-button .i-icon) {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

.table-toolbar :deep(.el-button .i-icon svg) {
  display: block;
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

.oir-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: 100%;
}

.oir-tip {
  display: inline-flex;
}

.oir-upload-btn {
  height: 24px;
  padding: 0;
}

.oir-name {
  max-width: 100%;
  padding: 0;
  overflow: hidden;
  border: none;
  background: none;
  color: #165dff;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.oir-name:disabled {
  color: #86909c;
  cursor: not-allowed;
}

.upload-summary {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  row-gap: 10px;
  margin-bottom: 16px;
  color: #1d2129;
  font-size: 14px;
}

.upload-summary span {
  color: #4e5969;
}

.upload-summary strong {
  font-weight: 500;
  word-break: break-all;
}

.oir-upload {
  width: 100%;
}

.oir-upload :deep(.el-upload),
.oir-upload :deep(.el-upload-dragger) {
  width: 100%;
}

.oir-upload :deep(.el-icon--upload) {
  margin-bottom: 8px;
  color: #c0c4cc;
  font-size: 64px;
  line-height: 1;
}

.oir-upload :deep(.el-upload__text em) {
  color: #165dff;
  font-style: normal;
}

.add-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.add-tabs :deep(.el-tabs__item) {
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  color: #4e5969;
}

.add-tabs :deep(.el-tabs__item.is-active) {
  color: #165dff;
}

.add-tabs :deep(.el-tabs__active-bar) {
  background-color: #165dff;
}

.add-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #f2f3f5;
}

.batch-hint {
  margin: 0 0 12px;
  color: #4e5969;
  font-size: 13px;
  line-height: 22px;
}

.batch-rules {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #f7f8fa;
  color: #4e5969;
  font-size: 13px;
  line-height: 22px;
}

.batch-rules p {
  margin: 0;
}

.batch-rules p+p {
  margin-top: 4px;
}

.batch-rules strong {
  color: #1d2129;
  font-weight: 600;
}

.batch-error-panel {
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  background: #fff2f0;
}

.batch-error-title {
  margin: 0 0 8px;
  color: #f53f3f;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.batch-error-panel ul {
  max-height: 180px;
  margin: 0;
  padding: 0;
  overflow: auto;
  list-style: none;
}

.batch-error-panel li {
  display: grid;
  grid-template-columns: 64px 108px minmax(0, 1fr);
  gap: 8px;
  padding: 6px 0;
  border-top: 1px solid #ffd8d4;
  color: #1d2129;
  font-size: 13px;
  line-height: 20px;
}

.batch-error-panel .row {
  color: #f53f3f;
  font-weight: 600;
}

.batch-error-panel .field {
  color: #4e5969;
  word-break: break-all;
}

.action-tip {
  display: inline-flex;
}

.table-actions :deep(.el-button) {
  opacity: 0.72;
}

.table-actions :deep(.el-button:hover) {
  opacity: 1;
}

.table-actions :deep(.submit-btn.is-muted),
.table-actions :deep(.submit-btn.is-muted:hover),
.table-actions :deep(.submit-btn.is-muted .i-icon) {
  color: #c9cdd4 !important;
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
  .submit-page {
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
/* 弹窗挂到 body，窄屏时收窄并允许内容滚动 */
@media (max-width: 768px) {
  .submit-dialog.el-dialog {
    width: calc(100vw - 24px) !important;
    max-width: calc(100vw - 24px);
  }

  .submit-dialog .el-dialog__body {
    max-height: 70vh;
    overflow: auto;
  }

  .submit-dialog .el-form-item__label {
    width: auto !important;
    height: auto;
    justify-content: flex-start;
    line-height: 22px;
  }

  .submit-dialog .el-form-item__content {
    margin-left: 0 !important;
  }
}

.batch-import-notice {
  width: 460px;
  padding: 16px 18px 14px;
  border-radius: 12px;
  border: 1px solid #ffece8;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
}

.batch-import-notice .el-notification__title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
}

.batch-import-notice .el-notification__content {
  margin-top: 8px;
  width: 100%;
}

.batch-import-notice .summary {
  margin: 0;
  color: #4e5969;
  font-size: 13px;
  line-height: 20px;
}

.batch-import-notice .batch-import-list {
  max-height: 280px;
  margin: 10px 0 0;
  padding: 0;
  overflow: auto;
  list-style: none;
}

.batch-import-notice .batch-import-list li {
  display: grid;
  grid-template-columns: 64px 108px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  padding: 8px 0;
  border-top: 1px solid #f2f3f5;
  font-size: 13px;
  line-height: 20px;
  color: #1d2129;
}

.batch-import-notice .row {
  color: #f53f3f;
  font-weight: 600;
}

.batch-import-notice .field {
  color: #4e5969;
  word-break: break-all;
}

.batch-import-notice .msg {
  word-break: break-word;
}

.batch-import-notice .more {
  margin: 8px 0 0;
  color: #86909c;
  font-size: 12px;
}
</style>
