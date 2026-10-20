<template>
  <div class="gene-gtp-page">
    <header class="page-head">
      <h2>GTP Mouse Strain</h2>
    </header>

    <section class="panel filter-panel">
      <div class="admin-filter">
        <div class="fi">
          <label>Gene</label>
          <el-input v-model="query.gene" placeholder="Enter gene name" clearable @keyup.enter="handleSearch" />
        </div>
        <div class="fi">
          <label>Mouse strain</label>
          <el-input v-model="query.mouseStrain" placeholder="Enter mouse strain" clearable @keyup.enter="handleSearch" />
        </div>
        <div class="fi"></div>
        <div class="fi btns">
          <el-button type="primary" @click="handleSearch">
            <IconSearch theme="outline" size="14" fill="currentColor" />
            Search
          </el-button>
        </div>
        <div class="fi"></div>
        <div class="fi"></div>
        <div class="fi"></div>
        <div class="fi btns">
          <el-button @click="handleReset">
            <IconRedo theme="outline" size="14" fill="currentColor" />
            Reset
          </el-button>
        </div>
      </div>
    </section>

    <section class="panel table-panel">
      <div class="table-toolbar">
        <el-button type="primary" @click="openDialog()">
          <IconPlus theme="outline" size="14" fill="currentColor" />
          Add
        </el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" class="data-table">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="gene" label="Gene" min-width="140" show-overflow-tooltip />
        <el-table-column prop="mouseStrain" label="Mouse strain" min-width="180" show-overflow-tooltip />
        <el-table-column prop="gtp" label="GTP link" min-width="280" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link v-if="row.gtp" :href="row.gtp" target="_blank" type="primary">
              {{ row.gtp }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="100" fixed="right" align="center">
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

    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? 'Edit GTP Mouse Strain' : 'Add GTP Mouse Strain'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="Gene" prop="gene">
          <el-input v-model="form.gene" maxlength="64" />
        </el-form-item>
        <el-form-item label="Mouse strain" prop="mouseStrain">
          <el-input v-model="form.mouseStrain" maxlength="128" />
        </el-form-item>
        <el-form-item label="GTP link" prop="gtp">
          <el-input v-model="form.gtp" maxlength="512" />
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
import type { GeneGtp } from '@/types/api'
import {
  createGeneGtp,
  deleteGeneGtp,
  getGeneGtpPage,
  updateGeneGtp
} from '@/service/api/geneGtp'
import { toast } from '@/utils/tools'
import {
  Delete as IconDelete,
  Edit as IconEdit,
  Plus as IconPlus,
  Redo as IconRedo,
  Search as IconSearch
} from '@icon-park/vue-next'
import '@icon-park/vue-next/styles/index.css'

defineOptions({
  name: 'GeneGtpIndex'
})

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const total = ref(0)
const tableData = ref<GeneGtp[]>([])
const formRef = ref<FormInstance>()

const query = reactive({
  page: 1,
  pageSize: 10,
  gene: '',
  mouseStrain: ''
})

const emptyForm = (): GeneGtp => ({
  id: 0,
  gene: '',
  mouseStrain: '',
  gtp: ''
})

const form = reactive<GeneGtp>(emptyForm())

const rules: FormRules = {
  gene: [{ required: true, message: 'Please enter gene name', trigger: 'blur' }],
  mouseStrain: [{ required: true, message: 'Please enter mouse strain', trigger: 'blur' }],
  gtp: [{ required: true, message: 'Please enter GTP link', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getGeneGtpPage({ ...query })
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
  query.mouseStrain = ''
  handleSearch()
}

const handleSizeChange = () => {
  query.page = 1
  loadData()
}

const assignForm = (row?: GeneGtp) => {
  const source = row || emptyForm()
  Object.assign(form, emptyForm(), source)
}

const openDialog = (row?: GeneGtp) => {
  assignForm(row)
  dialogVisible.value = true
}

const handleSave = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  saving.value = true
  try {
    const payload = {
      gene: form.gene.trim(),
      mouseStrain: form.mouseStrain.trim(),
      gtp: form.gtp.trim()
    }
    if (form.id) {
      await updateGeneGtp(form.id, payload)
      toast('Updated successfully')
    } else {
      await createGeneGtp(payload)
      toast('Created successfully')
    }
    dialogVisible.value = false
    loadData()
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row: GeneGtp) => {
  try {
    await ElMessageBox.confirm(`Delete GTP mouse strain record for gene ${row.gene}?`, 'Confirm', {
      type: 'warning',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    })
  } catch {
    return
  }
  await deleteGeneGtp(row.id)
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
.gene-gtp-page {
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

.filter-panel :deep(.admin-filter .fi .el-input__wrapper) {
  height: 36px;
  padding: 1px 12px;
  background: #fff;
  border-radius: 4px;
  box-shadow: none;
  border: 1px solid #e5e6eb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-panel :deep(.admin-filter .fi .el-input__wrapper:hover) {
  background: #fff;
  border-color: #c9cdd4;
  box-shadow: none;
}

.filter-panel :deep(.admin-filter .fi .el-input__wrapper.is-focus) {
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

.filter-panel :deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}

.filter-panel :deep(.el-button:not(.el-button--primary)) {
  color: #4e5969;
  background: #fff;
  border-color: #e5e6eb;
}

.table-panel {
  overflow: hidden;
}

.table-toolbar {
  display: flex;
  align-items: center;
  padding: 14px 16px 12px;
  border-bottom: 1px solid #f2f3f5;
}

.table-toolbar :deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
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
</style>
