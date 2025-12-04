<template>
  <q-page class="q-pa-md search-groups-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader 
              title="Buscar Ficha" 
              description="Busca fichas por código, instructor o estado." 
            />
          </q-card-section>
        </q-card>

        <div class="container">
          <div class="row justify-center">
            <div class="col-12 col-md-8">
              <q-select
                v-model="selectedFiche"
                :options="filteredFiches"
                use-input
                input-debounce="300"
                placeholder="Número de ficha"
                outlined
                class="search-select"
                clearable
                @filter="handleFilterFiches"
                @update:model-value="handleSelectFiche"
                @clear="handleClearSearch"
              >
                <template #prepend>
                  <q-icon name="search" color="green-8" size="20px" />
                </template>

                <template #append>
                  <q-icon 
                    v-if="selectedFiche" 
                    name="close" 
                    color="green-8" 
                    class="cursor-pointer" 
                    @click.stop="handleClearSearch"
                  />
                  <q-icon 
                    v-else 
                    name="expand_more" 
                    color="green-8" 
                  />
                </template>

                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No hay resultados
                    </q-item-section>
                  </q-item>
                </template>

                <template #selected>
                  <span v-if="selectedFiche">{{ selectedFiche }}</span>
                </template>
              </q-select>

              <div 
                v-if="!selectedFiche && showSuggestions && suggestedFiches.length > 0" 
                class="suggestions-container q-mt-md"
              >
                <div
                  v-for="fiche in suggestedFiches"
                  :key="fiche"
                  class="fiche-item"
                  @click="selectFiche(fiche)"
                >
                  Ficha {{ fiche }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEntityManager } from 'src/composables/useEntityManager'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'

const router = useRouter()

// ==================== COMPOSABLE CONFIGURATION ====================

// 1️⃣ Form structure
const getDefaultFormData = () => ({
  _id: '',
  ficheNumber: ''
})

// 2️⃣ API endpoints
const endpoints = {
  list: '/fiches/listFiches'
}

// 3️⃣ Custom messages
const customMessages = {
  listError: 'Error al cargar fichas',
  noData: 'No hay fichas registradas'
}

// 4️⃣ Function to process API response
const processFichesResponse = (response) => {
  const payload = response?.msg ?? response?.data ?? response ?? {}
  
  const fichesArray = Array.isArray(payload)
    ? payload
    : payload?.fiches || payload?.fichas || payload?.list || []
  
  return {
    data: Array.isArray(fichesArray) ? fichesArray : [],
    total: payload?.totalDocuments ?? payload?.total ?? fichesArray.length
  }
}

// 5️⃣ Initialize composable with standardized names
const {
  // States
  loadingTable,
  rows,
  filtersData,

  // Functions for filters
  handleSearchChange,

  // Functions for API
  fetchEntities
} = useEntityManager({
  entityName: 'fiche',
  entityNamePlural: 'fiches',
  getDefaultFormData,
  endpoints,
  messages: customMessages,
  processResponse: processFichesResponse
})

// ==================== ALIAS WITH STANDARDIZED NAMES ====================

// States
const rowsFiches = rows

// Functions for API
const fetchFiches = fetchEntities

// ==================== LOCAL STATE ====================

const selectedFiche = ref(null)
const showSuggestions = ref(false)
const filteredFiches = ref([])

// Hardcoded fiches (replace with API data later)
const allFiches = ref([
  '2926076',
  '2926065',
  '2926034',
  '2589667'
])

// ==================== COMPUTED ====================

const suggestedFiches = computed(() => allFiches.value)

// ==================== EVENT HANDLERS ====================

/**
 * Filters fiches based on user input
 * Only allows numbers, no letters or negative numbers
 */
function handleFilterFiches(val, update) {
  update(() => {
    // Remove any non-numeric characters
    const numericValue = val.replace(/[^0-9]/g, '')
    
    if (numericValue === '') {
      filteredFiches.value = [...allFiches.value]
      showSuggestions.value = false
      return
    }

    // Filter fiches that include the numeric input
    filteredFiches.value = allFiches.value.filter(fiche => 
      fiche.includes(numericValue)
    )
    
    showSuggestions.value = filteredFiches.value.length > 0
  })
}

/**
 * Handles fiche selection and navigates to detail page
 */
function handleSelectFiche(fiche) {
  if (fiche) {
    router.push(`/app/admin/documentos/${fiche}`)
  }
}

/**
 * Selects a fiche from suggestions
 */
function selectFiche(fiche) {
  selectedFiche.value = fiche
  handleSelectFiche(fiche)
}

/**
 * Clears the search and resets filtered fiches
 */
function handleClearSearch() {
  selectedFiche.value = null
  filteredFiches.value = [...allFiches.value]
  showSuggestions.value = false
}

// ==================== LIFECYCLE ====================

onMounted(async () => {
  // Initialize filtered fiches
  filteredFiches.value = [...allFiches.value]
  
  // Optionally fetch fiches from API
  // await fetchFiches()
  // allFiches.value = rowsFiches.value.map(f => f.ficheNumber)
})
</script>

<style lang="sass" scoped>
.search-groups-page
  background: #f5f7fb
  min-height: 100vh

.hero-card
  border-radius: 20px
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%)

.container
  max-width: 800px
  margin: 0 auto

.search-select
  width: 100%

// Forzar color verde para el icono de limpiar
:deep(.q-field__append .q-icon)
  color: #4CAF50 !important

:deep(.q-field__prepend .q-icon)
  color: #4CAF50 !important

.suggestions-container
  background: white
  border-radius: 8px
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
  padding: 10px
  max-height: 300px
  overflow-y: auto

.fiche-item
  padding: 12px 16px
  cursor: pointer
  border-radius: 4px
  transition: background-color 0.2s ease
  font-weight: 500
  color: #2c3e50

.fiche-item:hover
  background-color: #e8f5e9
  color: #4CAF50
</style>