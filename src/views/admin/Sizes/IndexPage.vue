<!-- views/admin/Sizes/IndexPage.vue -->
<template>
  <v-container fluid class="pa-0">
    <!-- Card chính -->
    <v-card>
      <!-- Header Card -->
      <v-toolbar
        color="transparent"
        flat
      >
        <v-toolbar-title class="text-h6">
          Danh sách kích thước
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <!-- Nút thêm mới -->
        <v-btn
          color="primary"
          :to="{ name: 'admin-sizes-create' }"
          prepend-icon="mdi-plus"
        >
          Thêm kích thước
        </v-btn>
      </v-toolbar>

      <v-divider></v-divider>

      <!-- Phần tìm kiếm -->
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="search"
              density="compact"
              variant="outlined"
              label="Tìm kiếm kích thước"
              prepend-inner-icon="mdi-magnify"
              single-line
              hide-details
              clearable
              class="mb-2"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Bảng dữ liệu -->
      <v-data-table
        :headers="headers"
        :items="sizes"
        :search="search"
        :loading="isLoading"
        hover
        density="comfortable"
      >
        <!-- STT Column -->
        <template #[`item.index`]="{ index }">
          <span class="font-weight-medium">{{ index + 1 }}</span>
        </template>

        <!-- Name Column -->
        <template #[`item.name`]="{ item }">
          <span class="font-weight-medium">{{ item.name }}</span>
        </template>

        <!-- Date Column -->
        <template #[`item.created_at`]="{ item }">
          <span class="text-grey">{{ formatDate(item.created_at) }}</span>
        </template>

        <!-- Actions Column -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex justify-center gap-2">
            <v-tooltip text="Chỉnh sửa" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  density="comfortable"
                  variant="text"
                  color="primary"
                  @click="editSize(item.id)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Xóa" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  density="comfortable"
                  variant="text"
                  color="error"
                  @click="confirmDelete(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>

        <!-- Loading state -->
        <template #loader>
          <v-sheet class="pa-3">
            <v-skeleton-loader type="table-row-divider"></v-skeleton-loader>
          </v-sheet>
        </template>

        <!-- Empty state -->
        <template #no-data>
          <v-sheet class="pa-6 text-center">
            <v-icon
              icon="mdi-alert-circle-outline"
              size="large"
              color="grey-darken-1"
              class="mb-3"
            ></v-icon>
            <div class="text-grey-darken-1">Không có dữ liệu</div>
          </v-sheet>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog xác nhận xóa -->
    <v-dialog
      v-model="deleteDialog"
      persistent
      width="auto"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-h6 pa-4 pb-2">
          <v-icon
            icon="mdi-alert"
            color="error"
            size="24"
            class="mr-2"
          ></v-icon>
          Xác nhận xóa
        </v-card-title>

        <v-card-text class="pa-4 py-2">
          Bạn có chắc chắn muốn xóa kích thước
          <strong>"{{ selectedSize?.name }}"</strong>?<br>
          Hành động này không thể hoàn tác.
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            variant="plain"
            @click="closeDeleteDialog"
            :disabled="deleteLoading"
          >
            Hủy
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="deleteLoading"
            @click="handleDelete"
          >
            Xóa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar thông báo -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="2000"
      location="top right"
    >
      {{ snackbar.text }}

      <template #actions>
        <v-btn
          variant="text"
          icon="mdi-close"
          @click="snackbar.show = false"
        ></v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

// Data
const search = ref('')
const deleteDialog = ref(false)
const deleteLoading = ref(false)
const selectedSize = ref(null)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Table headers
const headers = [
  {
    title: 'STT',
    key: 'index',
    align: 'center',
    sortable: false,
    width: '80'
  },
  {
    title: 'Tên kích thước',
    key: 'name',
    align: 'start'
  },
  {
    title: 'Ngày tạo',
    key: 'created_at',
    align: 'center',
    width: '200'
  },
  {
    title: 'Thao tác',
    key: 'actions',
    align: 'center',
    sortable: false,
    width: '120'
  }
]

// Computed
const sizes = computed(() => store.getters['sizes/sizes'])
const isLoading = computed(() => store.getters['sizes/isLoading'])

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const showMessage = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

const editSize = (id) => {
  router.push({
    name: 'admin-sizes-edit',
    params: { id }
  })
}

const confirmDelete = (size) => {
  selectedSize.value = size
  deleteDialog.value = true
}

const closeDeleteDialog = () => {
  deleteDialog.value = false
  selectedSize.value = null
}

const handleDelete = async () => {
  if (!selectedSize.value) return

  try {
    deleteLoading.value = true
    await store.dispatch('sizes/deleteSize', selectedSize.value.id)
    showMessage('Xóa kích thước thành công')
    closeDeleteDialog()
  } catch (error) {
    console.error('Delete failed:', error)
    showMessage(
      error.response?.data?.message || 'Có lỗi xảy ra khi xóa kích thước',
      'error'
    )
  } finally {
    deleteLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await store.dispatch('sizes/fetchSizes')
  } catch (error) {
    showMessage('Có lỗi khi tải dữ liệu', 'error')
  }
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>