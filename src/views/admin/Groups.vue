<template>
  <q-page class="q-pa-md groups-page">
    <BackButton class="q-mb-lg" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Buscar Ficha" description="Ingrese el número de la ficha para buscar" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="container">
      <div class="row justify-center q-mb-lg">
        <div class="col-12 col-md-8">
          <q-input
            v-model="ficheNumber"
            outlined
            placeholder="Escribe el número de la ficha..."
            clearable
            class="search-input"
            @keyup.enter="searchFiche"
          >
            <template #append>
              <Button
                icon="search"
                flat
                round
                dense
                custom-class="icon-button"
                @click="searchFiche"
                :loading="isLoading"
                :disable="!ficheNumber || ficheNumber.trim() === ''"
              >
                <template #default>
                  <q-tooltip>Buscar</q-tooltip>
                </template>
              </Button>
            </template>
          </q-input>
        </div>
      </div>

      <!-- Resultados de búsqueda -->
      <div v-if="searchResults.length > 0" class="row justify-center">
        <div class="col-12 col-md-8">
          <q-card class="results-card">
            <q-card-section class="results-header">
              <div class="text-h6">Resultados de búsqueda</div>
              <div class="text-caption text-grey-7">
                {{ searchResults.length }} ficha{{ searchResults.length !== 1 ? 's' : '' }} encontrada{{ searchResults.length !== 1 ? 's' : '' }}
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-none">
              <q-list>
                <q-item
                  v-for="fiche in searchResults"
                  :key="fiche._id"
                  clickable
                  v-ripple
                  @click="selectFiche(fiche)"
                  class="result-item"
                >
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white" size="48px">
                      <q-icon name="school" size="24px" />
                    </q-avatar>
                  </q-item-section>
                  
                  <q-item-section>
                    <q-item-label class="fiche-number">
                      Ficha {{ fiche.number }}
                    </q-item-label>
                    <q-item-label caption v-if="fiche.program && fiche.program.name" class="fiche-program-name">
                      {{ fiche.program?.name }}
                    </q-item-label>
                  </q-item-section>
                  
                  <q-item-section side>
                    <q-icon name="arrow_forward_ios" color="primary" size="20px" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Mensaje cuando no hay resultados -->
      <div v-else-if="hasSearched && !isLoading" class="row justify-center">
        <div class="col-12 col-md-8">
          <q-banner class="no-results-banner" rounded>
            <template v-slot:avatar>
              <q-avatar color="grey-4" text-color="grey-7" size="48px">
                <q-icon name="search_off" size="28px" />
              </q-avatar>
            </template>
            <div class="text-subtitle1 text-weight-medium q-mb-xs">
              No se encontraron fichas
            </div>
            <div class="text-body2 text-grey-7">
              No hay fichas registradas con el número: <strong>{{ ficheNumber }}</strong>
            </div>
          </q-banner>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getData } from '../../services/apiClient'
import { useNotifications } from '../../composables/useNotifications'
import BackButton from '../../components/BackButton.vue'
import Button from '../../components/Button.vue'
import PageHeader from '../../components/PageHeader.vue'

const router = useRouter()
const notifications = useNotifications()

const ficheNumber = ref('')
const searchResults = ref([])
const isLoading = ref(false)
const hasSearched = ref(false)

// Función flecha para buscar fichas por número
const searchFiche = async () => {
  if (!ficheNumber.value || ficheNumber.value.trim() === '') {
    notifications.warning('Por favor ingresa un número de ficha')
    return
  }

  isLoading.value = true
  hasSearched.value = true
  
  try {
    const response = await getData(`/fiches/listFiche?search=${ficheNumber.value.trim()}`)
    const fichesData = response?.msg || response?.data || []
    searchResults.value = Array.isArray(fichesData) ? fichesData : []
    console.log(fichesData)
    console.log('� Fichas encontradas:', searchResults.value.length)
    
    if (searchResults.value.length === 0) {
      notifications.info(`No se encontraron fichas con el número: ${ficheNumber.value}`)
    }
  } catch (error) {
    console.error('Error al buscar la ficha:', error)
    notifications.error('Error al buscar la ficha')
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

// Función para seleccionar una ficha y redirigir
const selectFiche = (fiche) => {
  router.push({
    name: 'Apprentices',
    query: { recordNumber: fiche.number }
  })
}
</script>

<style lang="sass" scoped>
.groups-page
  background: #f5f7fb
  min-height: 100vh

.hero-card
  border-radius: 20px
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%)

.container
  max-width: 900px
  margin: 0 auto

// Input de búsqueda
.search-input
  font-size: 1.1rem
  
  :deep(.q-field__control)
    height: 56px
    border-radius: 12px
    
  :deep(.q-field__label)
    font-size: 1rem
    font-weight: 500
    color: var(--color-text-secondary)
    
  :deep(.q-field__native)
    font-size: 1.1rem
    padding-top: 4px

.icon-button
  min-height: 40px
  width: 40px
  padding: 0
  border-radius: 50%
  background: transparent !important
  box-shadow: none !important
  color: var(--color-primary)
  display: flex
  align-items: center
  justify-content: center

  &:hover
    background-color: var(--color-bg-hover)
    box-shadow: none !important

// Card de resultados
.results-card
  border-radius: 12px
  box-shadow: 0 2px 12px var(--shadow-general)
  overflow: hidden
  transition: box-shadow 0.3s ease
  
  &:hover
    box-shadow: 0 4px 20px var(--shadow-general-medium)

.results-header
  background: var(--color-primary)
  color: white
  padding: 20px 24px
  
  .text-h6
    font-weight: 600
    font-size: 1.25rem
    margin-bottom: 4px
    
  .text-caption
    color: rgba(255, 255, 255, 0.9)
    font-size: 0.9rem

// Items de resultados
.result-item
  padding: 16px 24px
  border-bottom: 1px solid var(--color-border-light)
  transition: all 0.25s ease
  cursor: pointer
  
  &:last-child
    border-bottom: none
  
  &:hover
    background-color: var(--color-bg-hover)
    padding-left: 28px
    
    .q-icon
      transform: translateX(4px)
  
  .q-icon
    transition: transform 0.25s ease

.fiche-number
  font-size: 1.1rem
  font-weight: 600
  color: var(--color-text-primary)
  margin-bottom: 4px

.fiche-program-name
  font-size: 0.9rem
  color: var(--color-text-secondary)
  line-height: 1.4

// Banner sin resultados
.no-results-banner
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)
  border: 2px solid var(--color-border-light)
  border-radius: 12px
  padding: 24px
  box-shadow: 0 2px 8px var(--shadow-general)
  
  .text-subtitle1
    color: var(--color-text-primary)
    
  .text-body2
    color: var(--color-text-secondary)
    
    strong
      color: var(--color-primary)
      font-weight: 600

// Responsive
@media (max-width: 600px)
  .container
    padding: 0 12px
    
  .search-input
    :deep(.q-field__control)
      height: 52px
      
  .results-header
    padding: 16px 20px
    
    .text-h6
      font-size: 1.1rem
      
  .result-item
    padding: 14px 20px
    
  .fiche-number
    font-size: 1rem
    
  .fiche-program
    font-size: 0.85rem
</style>