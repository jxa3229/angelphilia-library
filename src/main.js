import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ElButton } from 'element-plus/es/components/button/index.mjs'
import { ElCarousel, ElCarouselItem } from 'element-plus/es/components/carousel/index.mjs'
import { ElConfigProvider } from 'element-plus/es/components/config-provider/index.mjs'
import { ElDialog } from 'element-plus/es/components/dialog/index.mjs'
import { ElDrawer } from 'element-plus/es/components/drawer/index.mjs'
import { ElEmpty } from 'element-plus/es/components/empty/index.mjs'
import { ElImage } from 'element-plus/es/components/image/index.mjs'
import { ElIcon } from 'element-plus/es/components/icon/index.mjs'
import { ElInput } from 'element-plus/es/components/input/index.mjs'
import { ElOption, ElSelect } from 'element-plus/es/components/select/index.mjs'
import { ElSwitch } from 'element-plus/es/components/switch/index.mjs'
import { ElTable, ElTableColumn } from 'element-plus/es/components/table/index.mjs'
import { ElTag } from 'element-plus/es/components/tag/index.mjs'
import { ElTooltip } from 'element-plus/es/components/tooltip/index.mjs'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { router } from './router'
import './styles/index.css'

const app = createApp(App)
const pinia = createPinia()
const elementComponents = [
  ElButton,
  ElCarousel,
  ElCarouselItem,
  ElConfigProvider,
  ElDialog,
  ElDrawer,
  ElEmpty,
  ElImage,
  ElIcon,
  ElInput,
  ElOption,
  ElSelect,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTooltip
]

app.use(pinia)
app.use(router)
elementComponents.forEach((component) => app.use(component))
app.mount('#app')
