<template>
  <div class="gene-gtp-page">
    <section class="panel filter-panel">
      <div class="admin-filter">
        <div class="fi">
          <label>Gene</label>
          <el-input v-model="query.gene" placeholder="Enter gene name" clearable @keyup.enter="handleSearch" />
        </div>
        <div class="fi">
          <label>Mouse strain</label>
          <el-input v-model="query.mouseStrain" placeholder="Enter mouse strain" clearable
            @keyup.enter="handleSearch" />
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
        <h2 class="table-title">GTP Mouse Strain</h2>
        <el-button type="primary" @click="openDialog()">
          <IconPlus theme="outline" size="14" fill="currentColor" />
          Add
        </el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" border class="data-table">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="gene" label="Gene" min-width="140" align="center" show-overflow-tooltip />
        <el-table-column prop="mouseStrain" label="Mouse strain" min-width="180" align="center" show-overflow-tooltip />
        <el-table-column prop="gtp" label="GTP link" min-width="280" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link v-if="row.gtp" :href="row.gtp" target="_blank" type="primary">
              {{ row.gtp }}
            </el-link>
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

    <el-dialog v-model="dialogVisible" :title="form.id ? 'Edit GTP Mouse Strain' : 'Add GTP Mouse Strain'" width="560px"
      destroy-on-close class="gene-gtp-dialog">
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

.panel {
  background: #fff;
  border: 1px solid rgba(29, 33, 41, 0.06);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.filter-panel {
  padding: 20px;
  margin-bottom: 16px;
}

.filter-panel :deep(.admin-filter) {
  flex-wrap: nowrap;
  align-items: center;
}

.filter-panel :deep(.admin-filter .fi) {
  flex: 1;
  width: auto;
  min-width: 0;
  margin-bottom: 0;
  padding-right: 16px;
}

.filter-panel :deep(.admin-filter .fi.btns) {
  flex: none;
  padding-right: 0;
}

.filter-panel :deep(.fi > label) {
  width: auto;
  color: #4e5969;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
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

.table-panel {
  overflow: hidden;
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
  gap: 8px;
}

.table-toolbar :deep(.el-button .i-icon) {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

.table-toolbar :deep(.el-button .i-icon svg) {
  display: block;
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
    flex-wrap: wrap;
  }

  .filter-panel :deep(.admin-filter .fi) {
    flex: 0 0 50%;
    width: 50%;
    margin-bottom: 12px;
  }

  .filter-panel :deep(.admin-filter .fi.btns) {
    flex: 0 0 100%;
    width: 100%;
    margin-bottom: 0;
    padding-right: 0;
    justify-content: flex-end;
  }
}

/* 手机：筛选条件纵向排列，按钮仍靠右 */
@media (max-width: 768px) {
  .gene-gtp-page {
    padding: 4px 12px 16px;
  }

  .filter-panel {
    padding: 14px 12px 12px;
  }

  .filter-panel :deep(.admin-filter .fi) {
    flex: 0 0 100%;
    width: 100%;
    padding-right: 0;
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
  .gene-gtp-dialog.el-dialog {
    width: calc(100vw - 24px) !important;
    max-width: calc(100vw - 24px);
  }

  .gene-gtp-dialog .el-dialog__body {
    max-height: 70vh;
    overflow: auto;
  }

  .gene-gtp-dialog .el-form-item__label {
    width: auto !important;
    height: auto;
    justify-content: flex-start;
    line-height: 22px;
  }

  .gene-gtp-dialog .el-form-item__content {
    margin-left: 0 !important;
  }
}
</style>
