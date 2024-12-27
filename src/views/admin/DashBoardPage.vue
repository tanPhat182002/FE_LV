<template>
  <v-container>
    <!-- Loading state -->
    <div v-if="isLoading" class="d-flex justify-center my-8">
      <v-progress-circular 
        indeterminate 
        color="primary"
        size="48"
      ></v-progress-circular>
    </div>

    <template v-else>
      <!-- Overview Cards -->
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon color="primary" size="32" class="me-3">mdi-package-variant</v-icon>
                <span class="text-subtitle-1 font-weight-medium">Tổng đơn hàng</span>
              </div>
              <div class="text-h5 font-weight-bold">{{ getOverview.total_orders }}</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon color="success" size="32" class="me-3">mdi-currency-usd</v-icon>
                <span class="text-subtitle-1 font-weight-medium">Doanh thu</span>
              </div>
              <div class="text-h5 font-weight-bold">{{ getFormattedRevenue.total_revenue }}</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon color="info" size="32" class="me-3">mdi-cube-outline</v-icon>
                <span class="text-subtitle-1 font-weight-medium">Sản phẩm</span>
              </div>
              <div class="text-h5 font-weight-bold">{{ getOverview.total_products }}</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon color="warning" size="32" class="me-3">mdi-account-group</v-icon>
                <span class="text-subtitle-1 font-weight-medium">Người dùng</span>
              </div>
              <div class="text-h5 font-weight-bold">{{ getOverview.total_users }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Charts Row -->
      <v-row class="mt-4">
        <!-- Revenue Chart -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-subtitle-1 font-weight-medium py-4 px-4">
              Doanh thu 7 ngày gần nhất
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <Line :data="getRevenueChartData" :options="revenueChartOptions" />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Order Status Chart -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title class="text-subtitle-1 font-weight-medium py-4 px-4">
              Trạng thái đơn hàng
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-6">
              <div style="height: 300px">
                <Doughnut 
                  :data="getOrderStatusChartData" 
                  :options="finalStatusChartOptions" 
                />
              </div>
              <div class="text-center mt-4">
                <div class="text-h6 font-weight-medium">
                  Tổng số đơn hàng
                </div>
                <div class="text-h4 font-weight-bold primary--text">
                  {{ getOverview.total_orders }}
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Bottom Row -->
      <v-row class="mt-4">
        <!-- Top Products -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="text-subtitle-1 font-weight-medium py-4 px-4">
              Top sản phẩm bán chạy
            </v-card-title>
            <v-divider></v-divider>
            <v-list>
              <v-list-item v-for="product in getTopProducts" :key="product.id">
                <v-list-item-title>{{ product.name }}</v-list-item-title>
                <template v-slot:append>
                  <div class="text-right">
                    <div class="text-body-2 font-weight-medium">
                      Đã bán: {{ product.total_sold }}
                    </div>
                    <div class="text-caption text-primary">
                      {{ formatPrice(product.total_revenue) }}
                    </div>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Recent Ratings -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="text-subtitle-1 font-weight-medium py-4 px-4 d-flex justify-space-between">
              <span>Đánh giá gần đây</span>
              <v-chip color="primary" size="small">
                {{ getRatingStats.total }} đánh giá
              </v-chip>
            </v-card-title>
            <v-divider></v-divider>
            <v-list>
              <v-list-item v-for="rating in getRecentRatings" :key="rating.id">
                <template v-slot:prepend>
                  <v-rating
                    :model-value="rating.star_rating"
                    readonly
                    density="compact"
                    size="small"
                    color="warning"
                  ></v-rating>
                </template>
                
                <v-list-item-title>{{ rating.user_name }}</v-list-item-title>
                <v-list-item-subtitle>{{ rating.comment }}</v-list-item-subtitle>
                
                <template v-slot:append>
                  <v-chip
                    :color="rating.is_approved ? 'success' : 'warning'"
                    size="small"
                    class="font-weight-medium"
                  >
                    {{ rating.is_approved ? 'Đã duyệt' : 'Chờ duyệt' }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>

      <!-- Thêm phần thống kê theo tháng -->
      <!-- <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title class="text-subtitle-1 font-weight-medium py-4 px-4">
              Doanh thu theo tháng
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <Line :data="getMonthlyChartData" :options="revenueChartOptions" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row> -->

      <!-- Thêm phần thống kê theo khoảng thời gian -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center py-4 px-4">
              <span class="text-subtitle-1 font-weight-medium">Thống kê theo thời gian</span>
              <v-row class="flex-grow-0" style="width: auto">
                <v-col cols="auto">
                  <v-text-field
                    v-model="dateRange.start"
                    label="Từ ngày"
                    type="date"
                    density="compact"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="auto">
                  <v-text-field
                    v-model="dateRange.end"
                    label="Đến ngày"
                    type="date"
                    density="compact"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="auto">
                  <v-btn
                    color="primary"
                    @click="fetchRevenueStats"
                    :loading="isLoading"
                    :disabled="!isValidDateRange"
                  >
                    Xem thống kê
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-title>
            <v-divider></v-divider>
            
            <v-card-text v-if="getRevenueStats.summary">
              <!-- Summary Cards -->
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="text-subtitle-2 mb-1">Tổng đơn hàng</div>
                      <div class="text-h6">{{ getRevenueStats.summary.total_orders }}</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="text-subtitle-2 mb-1">Tổng doanh thu</div>
                      <div class="text-h6">{{ formatPrice(getRevenueStats.summary.total_revenue) }}</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="text-subtitle-2 mb-1">Giá trị TB/đơn</div>
                      <div class="text-h6">{{ formatPrice(getRevenueStats.summary.average_order_value) }}</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="text-subtitle-2 mb-1">Số ngày</div>
                      <div class="text-h6">{{ getRevenueStats.summary.period.days }} ngày</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Chart -->
              <v-row class="mt-4">
                <v-col cols="12">
                  <Line :data="getRevenueStatsChartData" :options="revenueChartOptions" />
                </v-col>
              </v-row>

              <!-- Top Products -->
              <v-row class="mt-4">
                <v-col cols="12">
                  <div class="text-subtitle-1 font-weight-medium mb-4">Top sản phẩm bán chạy</div>
                  <v-table>
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th class="text-right">Số lượng</th>
                        <th class="text-right">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="product in getRevenueStats.top_products" :key="product.id">
                        <td>{{ product.name }}</td>
                        <td class="text-right">{{ product.total_sold }}</td>
                        <td class="text-right">{{ formatPrice(product.total_revenue) }}</td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup>
import {  computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const store = useStore()

// Computed properties from store
const isLoading = computed(() => store.getters['dashboard/isLoading'])
const getOverview = computed(() => store.getters['dashboard/getOverview'])
const getFormattedRevenue = computed(() => store.getters['dashboard/getFormattedRevenue'])
const getRevenueChartData = computed(() => store.getters['dashboard/getRevenueChartData'])
const getOrderStatusChartData = computed(() => store.getters['dashboard/getOrderStatusChartData'])
const getTopProducts = computed(() => store.getters['dashboard/getTopProducts'])
const getRecentRatings = computed(() => store.getters['dashboard/getRecentRatings'])
const getRatingStats = computed(() => store.getters['dashboard/getRatingStats'])

// Chart options
const revenueChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: value => formatPrice(value)
      }
    }
  },
  plugins: {
    legend: {
      position: 'top'
    }
  }
}

const statusChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        font: {
          family: 'Roboto',
          size: 14
        },
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.raw || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} đơn (${percentage}%)`;
        }
      }
    }
  },
  cutout: '60%',
  radius: '90%'
}

// Thêm animation khi hover
const hoverOptions = {
  onHover: (event, chartElement) => {
    event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
    if (chartElement && chartElement[0]) {
      const dataset = chartElement[0].dataset;
      // Tăng kích thước ph�n hover
      dataset.hoverOffset = 10;
    }
  }
}

// Kết hợp các options
const finalStatusChartOptions = {
  ...statusChartOptions,
  ...hoverOptions
}

// Format helpers
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

// Thêm state cho date range
const dateRange = ref({
  start: '',
  end: ''
})

// Computed để kiểm tra date range hợp lệ
const isValidDateRange = computed(() => {
  return dateRange.value.start && dateRange.value.end && 
         dateRange.value.start <= dateRange.value.end
})

// Method để fetch thống kê theo khoảng thời gian
const fetchRevenueStats = async () => {
  if (!isValidDateRange.value) return
  
  try {
    await store.dispatch('dashboard/fetchRevenueByDateRange', {
      startDate: dateRange.value.start,
      endDate: dateRange.value.end
    })
  } catch (error) {
    console.error('Error fetching revenue stats:', error)
  }
}

// Thêm computed properties
// const getMonthlyChartData = computed(() => store.getters['dashboard/getMonthlyChartData'])
const getRevenueStats = computed(() => store.getters['dashboard/getRevenueStats'])
const getRevenueStatsChartData = computed(() => store.getters['dashboard/getRevenueStatsChartData'])

// Fetch data on mount
onMounted(async () => {
  try {
    await store.dispatch('dashboard/fetchStatistics')
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error)
  }
})
</script>

<style scoped>
.v-card {
  border-radius: 12px;
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1);
}

/* Thêm animation cho biểu đồ */
.chartjs-render-monitor {
  transition: all 0.3s ease;
}

.v-list-item {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.v-list-item:last-child {
  border-bottom: none;
}
</style>