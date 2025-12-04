<template>
  <q-page class="q-pa-md pre-registration-page">
    <BackButton to="/app/aprendiz/inicio" />

    <div class="full-width row">
      <div class="col-12">
        <q-card class="shadow-1 hero-card q-mb-xl">
          <q-card-section>
            <PageHeader title="Pre-Registro de Etapa Productiva"
              description="Gestiona tu proceso de pre-registro y documentación requerida" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Pestañas -->
    <div class="tabs-container">
      <Button :class="['tab-btn', { active: activeTab === 'solicitudes' }]" label="Pre-Registro"
        @click="activeTab = 'solicitudes'" />
      <Button :class="['tab-btn', { active: activeTab === 'nuevo' }]" label="Validación de Documentos"
        @click="activeTab = 'nuevo'" />
    </div>

    <div class="contenido-principal">
      <!-- PRE-REGISTROS -->
      <div v-if="activeTab === 'solicitudes'" class="tab-panel">
        <div class="q-pa-md">
          <div class="container">
            <!-- Barra de búsqueda -->
            <div class="row items-center q-mb-md q-gutter-sm">
              <div class="col-12 col-md-3">
                <q-input v-model="filtersData.search" dense outlined placeholder="Buscar por número..."
                  @keyup.enter="handleSearchChange" clearable @clear="clearFilters">
                  <template v-slot:prepend>
                    <q-icon name="search" color="green-8" />
                  </template>
                </q-input>
              </div>
              <div class="col-auto">
                <Button label="+ Pre-registro Individual" custom-class="gradient-btn" @click="openFormDialogRegistration"
                  style="height: 36px; padding: 8px 16px;" />
              </div>
              <div class="col-auto">
                <Button label="+ Pre-registro Grupal" custom-class="gradient-btn" @click="openFormDialogGroupRegistration"
                  style="height: 36px; padding: 8px 16px;" />
              </div>
            </div>

            <!-- Tabla de mis registros -->
            <Table :data="rowsRegistrations" :columns="columns" row-key="_id"
              no-data-label="No tienes registros de EP. ¡Crea tu primer registro!" :rows-per-page-options="[10, 20, 50]"
              :initial-rows-per-page="10" :loading="loadingTable" v-model:pagination="pagination"
              @request="handlePaginationRequest">
              <template #body-cell-registration_status="props">
                <q-td :props="props">
                  <q-badge :color="getStatusColor(props.row.registration_status)">
                    {{ getStatusLabel(props.row.registration_status) }}
                  </q-badge>
                </q-td>
              </template>

              <template #body-cell-modality="props">
                <q-td :props="props">
                  {{ props.row.modality_id?.name || 'N/A' }}
                </q-td>
              </template>

              <template #body-cell-company="props">
                <q-td :props="props">
                  {{ props.row.company_id?.name || 'N/A' }}
                </q-td>
              </template>

              <template #body-cell-scheduled_start_date="props">
                <q-td :props="props">
                  {{ formatDate(props.row.scheduled_start_date) }}
                </q-td>
              </template>

              <template #body-cell-opciones="props">
                <q-td :props="props" class="text-center">
                  <q-btn flat round color="primary" icon="visibility" @click="openDetailsDialogRegistration(props.row)">
                    <q-tooltip>Ver detalles</q-tooltip>
                  </q-btn>
                  <q-btn v-if="canEdit(props.row)" flat round color="warning" icon="edit"
                    @click="populateFormForEditRegistration(props.row)">
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </Table>
          </div>
        </div>

        <!-- Modal de Detalles -->
        <Modal v-model="showDetailDialog" variant="view" width="900px" max-width="98vw">
          <template #header>
            <div class="modal-header">
              <q-icon name="visibility" size="24px" class="q-mr-sm" />
              <span class="text-h6">Detalles del Registro EP</span>
            </div>
          </template>
          <template #body>
            <div v-if="selectedRegistration" class="q-pa-md">
              <div class="modal-content-grid">
                <div class="col-12">
                  <div class="text-subtitle2 text-grey-8">Número de Registro</div>
                  <div class="text-body1 text-weight-bold">{{ selectedRegistration.registration_number || 'N/A' }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Modalidad</div>
                  <div class="text-body1">{{ selectedRegistration.modality_id?.name || 'N/A' }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Empresa</div>
                  <div class="text-body1">{{ selectedRegistration.company_id?.name || 'N/A' }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Fecha de Inicio</div>
                  <div class="text-body1">{{ formatDate(selectedRegistration.scheduled_start_date) }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-8">Estado</div>
                  <div>
                    <q-badge :color="getStatusColor(selectedRegistration.registration_status)">
                      {{ getStatusLabel(selectedRegistration.registration_status) }}
                    </q-badge>
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="text-subtitle2 text-grey-8">Total Horas Solicitadas</div>
                  <div class="text-body1">{{ selectedRegistration.total_requested_hours }} horas</div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="text-subtitle2 text-grey-8">Días Laborales</div>
                  <div class="text-body1">{{ selectedRegistration.working_days }} días/semana</div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="text-subtitle2 text-grey-8">Horas Diarias</div>
                  <div class="text-body1">{{ selectedRegistration.daily_hours }} horas/día</div>
                </div>
                <div class="col-12">
                  <div class="text-subtitle2 text-grey-8">Fecha de Registro</div>
                  <div class="text-body1">{{ formatDate(selectedRegistration.registration_date) }}</div>
                </div>

                <!-- Observaciones del Aprendiz -->
                <div v-if="selectedRegistration.apprentice_observations?.length > 0" class="col-12">
                  <div class="text-subtitle2 text-grey-8 q-mb-sm">Mis Observaciones</div>
                  <q-timeline color="primary">
                    <q-timeline-entry v-for="(obs, index) in selectedRegistration.apprentice_observations" :key="index"
                      :title="formatDate(obs.fecha)" :subtitle="obs.escrito_por">
                      <div>{{ obs.descripcion }}</div>
                    </q-timeline-entry>
                  </q-timeline>
                </div>

                <!-- Observaciones del Admin -->
                <div v-if="selectedRegistration.admin_observations?.length > 0" class="col-12">
                  <div class="text-subtitle2 text-grey-8 q-mb-sm">Observaciones del Administrador</div>
                  <q-timeline color="secondary">
                    <q-timeline-entry v-for="(obs, index) in selectedRegistration.admin_observations" :key="index"
                      :title="formatDate(obs.fecha)" :subtitle="obs.escrito_por">
                      <div>{{ obs.descripcion }}</div>
                    </q-timeline-entry>
                  </q-timeline>
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <div class="row justify-end full-width">
              <Button label="Cerrar" custom-class="boton-cerrar" @click="closeDetailsDialogRegistration" />
            </div>
          </template>
        </Modal>

        <!-- Modal de Creación/Edición -->
        <Modal v-model="showAddDialog" variant="edit" width="900px" max-width="98vw">
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon :name="isEditMode ? 'edit' : 'add'" size="24px" class="q-mr-sm" />
                {{ isEditMode ? 'Editar' : 'Nuevo' }} Registro de Etapa Productiva
              </div>
            </div>
          </template>
          <template #body>
            <q-form ref="formRef" class="q-pa-md">
              <div class="modal-column">
                
                <!-- Número de Registro (solo en edición) -->
                <div v-if="isEditMode" class="col-12">
                  <q-input v-model="formDataRegistration.registration_number" label="Número de Registro" filled dense
                    readonly hint="Número de registro asignado" />
                </div>

                <!-- Información del aprendiz (solo lectura) -->
                <div class="col-12">
                  <q-banner class="bg-blue-1">
                    <template v-slot:avatar>
                      <q-icon name="account_circle" color="primary" />
                    </template>
                    <div class="text-body2">
                      <strong>Registrando para:</strong> {{ apprenticeName }}
                    </div>
                  </q-banner>
                </div>

                <div class="section-title">Detalles de la Etapa Productiva</div>
                <!-- Seleccionar Modalidad -->
                  <q-select 
                  v-model="formDataRegistration.modality_id" 
                  :options="modalityOptions" 
                  option-value="_id"
                    option-label="name" 
                    emit-value map-options label="Modalidad EP *" 
                    filled 
                    dense
                    :rules="[requiredRule]">
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No hay modalidades disponibles
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>

                <!-- Fecha de Inicio Programada -->
                  <q-input 
                  v-model="formDataRegistration.scheduled_start_date" 
                  label="Fecha de Inicio Programada *"
                    filled 
                    dense 
                    type="date" 
                    :rules="[requiredRule]" />

                     <!-- Días Laborales por Semana -->
                  <q-input v-model.number="formDataRegistration.working_days" 
                  label="Días Laborales por Semana *" 
                  filled
                    dense 
                    type="number"
                    :rules="[requiredRule, (val) => {const num = parseInt(val) || 0; return (num >= 1 && num <= 7) || 'Debe estar entre 1 y 7'}]" />


              </div>

                <div class="modal-column">
                  <div class="section-title">Configuración de Horas</div>

                <!-- Total Horas Solicitadas -->
                <div class="col-12 col-md-6">
                  <q-input 
                  v-model.number="formDataRegistration.total_requested_hours" 
                  label="Total Horas Solicitadas *"
                    filled 
                    dense 
                    type="number" 
                    :readonly="!isHoursBasedModality"
                    :disable="!isHoursBasedModality"
                    :rules="isHoursBasedModality ? [requiredRule, (val) => (parseInt(val) || 0) > 0 || 'Debe ser mayor a 0'] : []"
                    :bg-color="!isHoursBasedModality ? 'grey-3' : 'white'">
                    <template v-slot:prepend>
                      <q-icon name="schedule" :color="isHoursBasedModality ? 'primary' : 'grey'" />
                    </template>
                    <template v-slot:hint v-if="!isHoursBasedModality">
                      Esta modalidad no usa horas
                    </template>
                  </q-input>
                </div>

                <!-- Total Meses Solicitados -->
                <div class="col-12 col-md-6">
                  <q-input 
                  v-model.number="formDataRegistration.total_requested_months" 
                  label="Total Meses Solicitados *"
                    filled 
                    dense 
                    type="number" 
                    :readonly="!isMonthsBasedModality"
                    :disable="!isMonthsBasedModality"
                    :rules="isMonthsBasedModality ? [requiredRule, (val) => (parseInt(val) || 0) > 0 || 'Debe ser mayor a 0'] : []"
                    :bg-color="!isMonthsBasedModality ? 'grey-3' : 'white'">
                    <template v-slot:prepend>
                      <q-icon name="calendar_month" :color="isMonthsBasedModality ? 'primary' : 'grey'" />
                    </template>
                    <template v-slot:hint v-if="!isMonthsBasedModality">
                      Esta modalidad no usa meses
                    </template>
                  </q-input>
                </div>

                <!-- Horas Diarias -->
                <div class="col-12 col-md-6">
                  <q-input 
                  v-model.number="formDataRegistration.daily_hours" 
                  label="Horas Diarias *" 
                  filled 
                  dense
                    type="number" 
                    :rules="[requiredRule, (val) => {const num = parseInt(val) || 0; return (num >= 1 && num <= 24) || 'Debe estar entre 1 y 24'}]" />
                </div>

                <!-- ARL del SENA Requerida -->
                <div class="col-12 col-md-6">
                  <q-checkbox 
                  v-model="formDataRegistration.sena_required_arl" 
                  label="ARL del SENA Requerida" 
                  color="primary" />
                </div>

                <!-- Tipo de Proyecto -->
                <div class="col-12 col-md-6">
                  <q-select 
                  v-model="formDataRegistration.project_type" 
                  :options="projectTypeOptions" 
                  label="Tipo de Proyecto *" 
                  filled 
                  dense
                  emit-value
                  map-options
                  :rules="[(val) => val !== null && val !== undefined && val !== '' || 'Debe seleccionar un tipo de proyecto']" />
                </div>

                <div class="section-title">Información Empresas</div>

                  <!-- Seleccionar Empresa -->
                <div class="col-12 col-md-6">
                  <q-select 
                  v-model="formDataRegistration.company_id" 
                  :options="companyOptionsForForm"
                    option-value="_id" 
                    option-label="name" 
                    emit-value map-options label="Empresa *" 
                    filled 
                    dense
                    :rules="[requiredRule]"  
                    use-input 
                    input-debounce="300"
                    @filter="filterCompaniesForForm">
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No hay empresas disponibles
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <!-- Botón para crear nueva empresa -->
                <div class="col-12 col-md-6">
                  <Button label="+ Crear Nueva Empresa" custom-class="gradient-btn" @click="openFormDialogCompany"
                    style="width: 100%; height: 40px;" />
                </div>

                <!-- Advertencia si está editando -->
                <div v-if="isEditMode" class="col-12">
                  <q-banner class="bg-orange-1">
                    <template v-slot:avatar>
                      <q-icon name="warning" color="orange" />
                    </template>
                    <div class="text-body2">
                      Solo puedes editar registros que aún no han sido validados por el administrador.
                    </div>
                  </q-banner>
                </div>
              </div>
            </q-form>
              </template>

              <template #footer>
                <!-- Botones de acción -->
                <div class="col-12 q-mt-md">
                  <div class="row justify-end q-gutter-sm">
                    <Button label="Cancelar" custom-class="boton-cerrar" @click="closeFormDialogRegistration" />
                    <Button v-if="!isEditMode" label="Registrar y Enviar" custom-class="boton-enviar"
                      @click="handleSubmitAndSend" :loading="loading" />
                    <Button v-if="isEditMode" label="Actualizar" custom-class="boton-enviar"
                      @click="submitFormRegistration" :loading="loading" />
                    <Button v-if="isEditMode && canSend(selectedRegistration)" label="Enviar a Validación"
                      custom-class="boton-enviar" @click="handleSendFromModal" :loading="loading" />
                  </div>
                </div>
          </template>
        </Modal>

        <!-- Modal de Nueva Empresa -->
        <Modal v-model="showCompanyDialog" variant="edit" width="700px" max-width="98vw">
          <template #header>
            <div class="modal-header">
              <q-icon name="business" size="24px" class="q-mr-sm" />
              <span class="text-h6">Registrar Nueva Empresa</span>
            </div>
          </template>
          <template #body>
            <q-form ref="newCompanyFormRef" class="q-pa-md">
              <div class="modal-column">
                <div class="section-title">Datos de la empresa</div>
                  <q-input 
                  v-model="formDataCompany.companyNit" 
                  label="NIT de la Empresa *" filled dense
                    :rules="[requiredRule]" />
                
                  <q-input v-model="formDataCompany.name" 
                  label="Nombre de la Empresa *" 
                  filled 
                  dense
                    :rules="[requiredRule]"  />
                
                  <q-input v-model="formDataCompany.location" 
                  label="Ubicación/Ciudad *" 
                  filled 
                  dense
                    :rules="[requiredRule]" />
              </div>
               
               <div class="modal-column">
                <div class="section-title">Contacto de la empresa</div>
                  <q-input 
                  v-model="formDataCompany.legalRepresentativeName" 
                  label="Nombre del Representante Legal *"
                    filled 
                    dense 
                    :rules="[requiredRule]"  />
                
                  <q-input 
                  v-model="formDataCompany.legalRepresentativeEmail" 
                  label="Email del Representante *" filled
                    dense 
                    type="email" 
                    :rules="[requiredRule]" />
               
                  <q-input 
                  v-model="formDataCompany.legalRepresentativePhone" 
                  label="Teléfono del Representante *"
                    filled 
                    dense 
                    :rules="[requiredRule]"/>

                  <q-input 
                  v-model="formDataCompany.legalRepresentativePosition" 
                  label="Cargo del Representante *"
                    filled 
                    dense 
                    :rules="[requiredRule]" />
               </div>
            </q-form>
          </template>
          <template #footer>
            <Button label="Cancelar" custom-class="boton-cerrar" @click="closeFormDialogCompany" />
            <Button label="Registrar Empresa" custom-class="boton-enviar" @click="submitFormCompany"
              :loading="loading" />
          </template>
        </Modal>

        <!-- Modal de Pre-registro Grupal -->
        <Modal v-model="showGroupDialog" variant="edit" width="900px" max-width="98vw">
          <template #header>
            <div class="modal-header">
              <q-icon name="group" size="24px" class="q-mr-sm" />
              <span class="text-h6">Pre-registro Grupal de Etapa Productiva</span>
            </div>
          </template>
          <template #body>
            <q-form ref="groupFormRef" class="q-pa-md">
              <div class="modal-column">
                
                <div class="section-title">Información del Proyecto</div>
                
                <!-- Nombre del Proyecto -->
                <q-input 
                  v-model="formDataGroup.projectName" 
                  label="Nombre del Proyecto *" 
                  filled 
                  dense
                  :rules="[requiredRule]" 
                  hint="Ingrese el nombre descriptivo del proyecto grupal" 
                  class="q-mb-md" />

                <!-- Descripción del Proyecto -->
                <q-input 
                  v-model="formDataGroup.projectDescription" 
                  label="Descripción del Proyecto *" 
                  placeholder="Escriba la descripción del proyecto aquí..."
                  filled 
                  dense
                  type="textarea"
                  rows="2"
                  :rules="[(val) => !!val && val.trim().length >= 10 || 'La descripción debe tener al menos 10 caracteres']" 
                  hint="Mínimo 10 caracteres requeridos" 
                  class="q-mb-md" />

                <!-- Tipo de Proyecto -->
                <q-select 
                  v-model="formDataGroup.projectType" 
                  :options="projectTypeOptions" 
                  label="Tipo de Proyecto *" 
                  filled 
                  dense
                  emit-value
                  map-options
                  :rules="[(val) => val !== null && val !== undefined && val !== '' || 'Debe seleccionar un tipo de proyecto']" />

                <div class="section-title">Configuración de Etapa Productiva</div>

                <!-- Seleccionar Modalidad -->
                <q-select 
                  v-model="formDataGroup.modality_id" 
                  :options="modalityOptions" 
                  option-value="_id"
                  option-label="name" 
                  emit-value 
                  map-options 
                  label="Modalidad EP *" 
                  filled 
                  dense
                  :rules="[requiredRule]">
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No hay modalidades disponibles
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

                <!-- Fecha de Inicio Programada -->
                <q-input 
                  v-model="formDataGroup.scheduled_start_date" 
                  label="Fecha de Inicio Programada *"
                  filled 
                  dense 
                  type="date" 
                  :rules="[requiredRule]" />

                <!-- Días Laborales por Semana -->
                <q-input 
                  v-model.number="formDataGroup.working_days" 
                  label="Días Laborales por Semana *" 
                  filled
                  dense 
                  type="number"
                  :rules="[requiredRule, (val) => {const num = parseInt(val) || 0; return (num >= 1 && num <= 7) || 'Debe estar entre 1 y 7'}]" />

                <!-- Horas Diarias -->
                <q-input 
                  v-model.number="formDataGroup.daily_hours" 
                  label="Horas Diarias *" 
                  filled 
                  dense
                  type="number" 
                  :rules="[requiredRule, (val) => {const num = parseInt(val) || 0; return (num >= 1 && num <= 24) || 'Debe estar entre 1 y 24'}]" />

                <!-- Total Meses Solicitados -->
                <q-input 
                  v-model.number="formDataGroup.totalRequestedMonths" 
                  label="Total Meses Solicitados *"
                  filled 
                  dense 
                  type="number" 
                  :rules="[requiredRule, (val) => (parseInt(val) || 0) > 0 || 'Debe ser mayor a 0']"
                  hint="Duración del proyecto en meses" />

                <!-- ARL del SENA Requerida -->
                <q-checkbox 
                  v-model="formDataGroup.sena_required_arl" 
                  label="ARL del SENA Requerida" 
                  color="primary" />

                <div class="section-title">Información Empresas</div>

                <!-- Seleccionar Empresa -->
                <q-select 
                  v-model="formDataGroup.company_id" 
                  :options="companyOptionsForForm"
                  option-value="_id" 
                  option-label="name" 
                  emit-value 
                  map-options 
                  label="Empresa *" 
                  filled 
                  dense
                  :rules="[requiredRule]"  
                  use-input 
                  input-debounce="300"
                  @filter="filterCompaniesForForm">
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No hay empresas disponibles
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

                <!-- Botón para crear nueva empresa -->
                <Button 
                  label="+ Crear Nueva Empresa" 
                  custom-class="gradient-btn" 
                  @click="openFormDialogCompany"
                  style="width: 100%; height: 40px; margin-top: 8px;" />

              </div>

              <div class="modal-column">
                <div class="section-title">Selección de Compañeros</div>

                <!-- Información del usuario actual -->
                <q-banner dense class="bg-blue-1 text-blue-8 q-mb-sm">
                  <template v-slot:avatar>
                    <q-icon name="group" />
                  </template>
                  <div class="text-caption">
                    <strong>Líder del grupo:</strong> {{ apprenticeName }}<br>
                    Ingresa tu documento y el de tus compañeros para el registro grupal
                  </div>
                </q-banner>

                <!-- Campo para documento del usuario logueado -->
                <div class="user-document-section q-mb-md">
                  <q-input 
                    v-model="userOwnDocument" 
                    label="Tu Número de Documento *" 
                    filled 
                    dense
                    placeholder="Ej: 12345678"
                    :rules="[(val) => validateDocumentFormat(val).valid || validateDocumentFormat(val).message]">
                    <template v-slot:prepend>
                      <q-icon name="badge" color="primary" />
                    </template>
                    <template v-slot:hint>
                      Tu documento como líder del grupo
                    </template>
                  </q-input>
                </div>

                <!-- Búsqueda de Aprendices por Documento -->
                <div class="apprentices-section">
                  <div class="text-body2 q-mb-sm">
                    <strong>Agregar Compañeros al Grupo</strong>
                  </div>
                  
                  <!-- Campo de agregar documento -->
                  <div class="add-document-section q-mb-md">
                    <q-input 
                      v-model="apprenticeSearch" 
                      label="Número de Documento del Compañero" 
                      filled 
                      dense
                      placeholder="Ej: 10000001"
                      @keyup.enter="addApprenticeByDocument(apprenticeSearch)"
                      clearable>
                      <template v-slot:prepend>
                        <q-icon name="person_add" />
                      </template>
                      <template v-slot:append>
                        <q-btn 
                          flat 
                          round 
                          dense 
                          icon="add" 
                          color="primary"
                          @click="addApprenticeByDocument(apprenticeSearch)"
                          :disable="!apprenticeSearch || apprenticeSearch.length < 6">
                          <q-tooltip>Agregar documento</q-tooltip>
                        </q-btn>
                      </template>
                    </q-input>
                    
                    <!-- Botón removido -->
                  </div>

                  <!-- Resumen del Grupo -->
                  <div class="selected-apprentices">
                    <div class="text-body2 q-mb-sm">
                      <strong>Integrantes del Proyecto ({{ selectedApprentices.length + 1 }} total):</strong>
                    </div>
                    
                    <!-- Usuario actual (siempre incluido) -->
                    <q-card flat bordered class="apprentice-card q-mb-xs current-user-card">
                      <q-card-section class="q-pa-sm">
                        <div class="row items-center">
                          <div class="col">
                            <div class="text-subtitle2">
                              {{ apprenticeName }}
                              <q-chip size="xs" color="primary" text-color="white" dense class="q-ml-sm">TÚ</q-chip>
                            </div>
                            <div class="text-caption text-grey-6">Líder del registro</div>
                          </div>
                          <div class="col-auto">
                            <q-icon name="person" color="primary" size="sm" />
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                    
                    <!-- Compañeros agregados -->
                    <div v-if="selectedApprentices.length > 0" class="text-body2 q-mb-xs q-mt-sm">
                      <strong>Compañeros agregados:</strong>
                    </div>
                    <div class="apprentices-list">
                      <q-card 
                        v-for="(document, index) in selectedApprentices" 
                        :key="document"
                        flat 
                        bordered 
                        class="apprentice-card q-mb-xs">
                        <q-card-section class="q-pa-sm">
                          <div class="row items-center">
                            <div class="col-auto q-mr-sm">
                              <q-icon 
                                name="person"
                                color="primary"
                                size="sm">
                                <q-tooltip>
                                  Documento agregado - será validado por el administrador
                                </q-tooltip>
                              </q-icon>
                            </div>
                            <div class="col">
                              <div class="text-subtitle2">Compañero {{ index + 1 }}</div>
                              <div class="text-caption text-grey-6">Documento: {{ document }}</div>
                              <div class="text-caption text-grey-6 text-italic">
                                Pendiente de validación administrativa
                              </div>
                            </div>
                            <div class="col-auto">
                              <q-btn 
                                flat 
                                round 
                                dense 
                                icon="close" 
                                color="negative"
                                @click="removeApprenticeFromSelection(document)">
                                <q-tooltip>Remover</q-tooltip>
                              </q-btn>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </div>

                <!-- Validación de Selección -->
                <div v-if="selectedApprentices.length < 1" class="text-negative text-caption q-mt-sm">
                  ⚠️ Debe agregar al menos 1 compañero para el registro grupal
                </div>
                <div v-if="selectedApprentices.length >= 1" class="text-positive text-caption q-mt-sm">
                  ✅ {{ selectedApprentices.length + 1 }} integrantes total (tú + {{ selectedApprentices.length }} compañero{{ selectedApprentices.length > 1 ? 's' : '' }})
                </div>

              </div>
            </q-form>
          </template>

          <template #footer>
            <div class="col-12 q-mt-md">
              <div class="row justify-end q-gutter-sm">
                <Button label="Cancelar" custom-class="boton-cerrar" @click="closeFormDialogGroupRegistration" />
                <Button 
                  label="Registrar Grupo y Enviar" 
                  custom-class="boton-enviar"
                  @click="submitFormGroupRegistration" 
                  :loading="loading"
                  :disable="selectedApprentices.length < 1" />
              </div>
            </div>
          </template>
        </Modal>

        <!-- Modal de Agregar Múltiples Documentos -->
        <q-dialog v-model="showBulkAddDialog" persistent>
          <q-card style="min-width: 400px; max-width: 600px;">
            <q-card-section>
              <div class="text-h6">Agregar Múltiples Aprendices</div>
              <div class="text-caption text-grey-6">
                Ingrese los números de documento de sus compañeros separados por comas o en líneas diferentes.<br>
                <strong>Ejemplo:</strong> Si van a trabajar María (10000002) y Carlos (10000003), escriba: 10000002, 10000003
              </div>
            </q-card-section>

            <q-card-section>
              <q-textarea
                v-model="bulkDocuments"
                label="Documentos de Aprendices"
                placeholder="10000001, 10000002&#10;10000003&#10;10000004"
                filled
                rows="5"
                hint="Ejemplo: 10000001, 10000002 o uno por línea"
                clearable
              />
              
              <q-banner dense class="bg-orange-1 text-orange-8 q-mt-sm">
                <template v-slot:avatar>
                  <q-icon name="warning" />
                </template>
                <div class="text-caption">
                  Los documentos se agregarán sin validación previa. Asegúrate de que sean correctos.
                </div>
              </q-banner>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancelar" color="negative" @click="showBulkAddDialog = false; bulkDocuments = ''" />
              <q-btn 
                label="Agregar Todos" 
                color="primary" 
                @click="addMultipleApprentices"
                :disable="!bulkDocuments || !bulkDocuments.trim()" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>

      <!-- VALIDACIÓN DE DOCUMENTOS -->
      <div v-if="activeTab === 'nuevo'" class="tab-panel">
        <div class="container">
          <q-card class="section-card q-mb-lg">
            <q-card-section class="section-content">
              <div class="message-section q-mb-lg">
                <div class="message-text q-mb-md">
                  Tu prerregistro ha sido aprobado exitosamente.
                </div>
                <div class="message-text">
                  Para continuar con el proceso, por favor envía los siguientes documentos utilizando las plantillas
                  adjuntas:
                </div>
              </div>

              <div class="recommendation-box q-mb-xl">
                <div class="recommendation-content">
                  <q-icon name="info" size="20px" class="q-mr-sm" />
                  <div class="recommendation-text">
                    Te recomendamos revisar cuidadosamente que toda la información esté completa y firmada antes de
                    enviarla.
                  </div>
                </div>
              </div>

              <div class="upload-section q-mb-xl">
                <div class="upload-label-group q-mb-md">
                  <div class="upload-label">Seleccionar archivo</div>
                  <div class="upload-sublabel">Formatos permitidos: PDF</div>
                </div>
                <div class="upload-input-group">
                  <q-file v-model="selectedFile" filled dense accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    :disable="loading" clearable class="custom-file-input" @update:model-value="handleFileChange">
                    <template v-slot:prepend>
                      <q-icon name="attach_file" />
                    </template>
                  </q-file>
                </div>
              </div>

              <div v-if="selectedFile" class="file-info-box q-mb-lg">
                <q-icon name="description" size="18px" class="q-mr-sm" />
                <span class="file-name">{{ selectedFile.name }}</span>
                <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
              </div>

              <div class="form-actions">
                <Button label="Enviar Documentos" custom-class="boton-enviar" :loading="loading"
                  :disable="!selectedFile" @click="openConfirmationDialog" />
                <Button label="Cancelar" custom-class="boton-cerrar" :disable="loading" @click="handleCancel" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Modal de confirmación -->
        <Modal v-model="showConfirmationDialog" width="500px" max-width="95vw" persistent>
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="send" class="q-mr-sm" />
                Confirmar Envío
              </div>
            </div>
          </template>

          <template #body>
            <div class="q-pa-md text-center">
              <div class="text-h6 q-mb-md">¿Está seguro de que desea enviar este documento?</div>
              <p class="confirmation-text text-body1">
                Una vez enviado, el documento será revisado por el equipo administrativo.
                Recibirás una notificación cuando tu documento haya sido validado.
              </p>
            </div>
          </template>

          <template #footer>
            <div class="row justify-end q-gutter-sm full-width">
              <Button label="Cancelar" custom-class="boton-cerrar" @click="closeConfirmationDialog"
                :disable="loading" />
              <Button label="Enviar" custom-class="boton-enviar" @click="submitDocuments" :loading="loading" />
            </div>
          </template>
        </Modal>

        <!-- Modal de cancelación -->
        <Modal v-model="showCancellationDialog" width="500px" max-width="95vw" persistent>
          <template #header>
            <div class="modal-header">
              <div class="text-h6 flex items-center">
                <q-icon name="cancel" class="q-mr-sm" color="negative" />
                Confirmar Cancelación
              </div>
            </div>
          </template>

          <template #body>
            <div class="q-pa-md text-center">
              <div class="text-h6 q-mb-md">¿Estás seguro de que deseas cancelar?</div>
              <p class="confirmation-text text-body1">
                Se perderá el archivo seleccionado y tendrás que volver a seleccionarlo si decides continuar más tarde.
              </p>
            </div>
          </template>

          <template #footer>
            <div class="row justify-end q-gutter-sm full-width">
              <Button label="No, continuar" custom-class="boton-enviar" @click="closeCancellationDialog"
                :disable="loading" />
              <Button label="Sí, cancelar" custom-class="boton-cerrar" @click="confirmCancel" :disable="loading" />
            </div>
          </template>
        </Modal>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getData, postData, putData } from 'src/services/apiClient'
import { useNotifications } from 'src/composables/useNotifications'
import { useAuthStore } from 'src/stores/authStore'
import { useEntityManager } from 'src/composables/useEntityManager'
import Button from 'src/components/Button.vue'
import BackButton from 'src/components/BackButton.vue'
import PageHeader from 'src/components/PageHeader.vue'
import Modal from 'src/components/Modal.vue'
import Table from 'src/components/Table.vue'

// ==================== CONSTANTES ====================
const REGISTRATION_STATUS = { PENDING: 3, REJECTED: 1, APPROVED: 0 }
const REGISTRATION_STATUS_LABELS = {
  [REGISTRATION_STATUS.PENDING]: 'Pendiente',
  [REGISTRATION_STATUS.REJECTED]: 'Rechazado',
  [REGISTRATION_STATUS.APPROVED]: 'Aprobado'
}

const router = useRouter()
const $q = useQuasar()
const notifications = useNotifications()
const requiredRule = (value) => !!value || 'Este campo es requerido'
const authStore = useAuthStore()

// ==================== ENTITY MANAGER - REGISTRATIONS ====================
const {
  loading,
  loadingTable,
  rows: rowsRegistrations,
  showAddDialog,
  showDetailDialog,
  isEditMode,
  selectedEntity: selectedRegistration,
  formData: formDataRegistration,
  filtersData,
  pagination,
  handlePaginationRequest,
  handleSearchChange,
  clearFilters,
  openFormDialog: openFormDialogRegistration,
  closeFormDialog: closeFormDialogRegistration,
  openDetailsDialog: openDetailsDialogRegistration,
  closeDetailsDialog: closeDetailsDialogRegistration,
  populateFormForEdit: populateFormForEditRegistration,
  fetchEntities: fetchRegistrations
} = useEntityManager({
  entityName: 'registro',
  entityNamePlural: 'registros',
  getDefaultFormData: () => ({
    _id: '',
    registration_number: '',
    modality_id: '',
    company_id: '',
    scheduled_start_date: '',
    total_requested_hours: '',
    total_requested_months: '',
    working_days: '',
    daily_hours: '',
    sena_required_arl: false,
    project_type: null,
    companyData: null
  }),
  endpoints: {
    list: 'preRegistrations/listPreRegistrations',
    create: 'preRegistrations/savePreRegistration',
    update: (id) => `preRegistrations/updatePreRegistration/${id}`
  },
  buildFilterParams: (filters, params) => {
    const apprenticeId = authStore.user?._id || authStore.user?.id || authStore.user?.userId
    params.apprentice = apprenticeId

    if (filters.search?.trim()) {
      params.registrationNumber = filters.search.trim()
    }

    return params
  },
  processResponse: (response) => {
    let data = []
    if (response?.registrations && Array.isArray(response.registrations)) {
      data = response.registrations
    } else if (response?.msg && Array.isArray(response.msg)) {
      data = response.msg
    } else if (response?.data && Array.isArray(response.data)) {
      data = response.data
    } else if (Array.isArray(response)) {
      data = response
    }

    const processed = data.map(item => ({
      ...item,
      registration_number: item.registration_number ?? item.registrationNumber,
      total_requested_hours: item.total_requested_hours ?? item.totalRequestedHours,
      scheduled_start_date: item.scheduled_start_date ?? item.scheduledStartDate,
      registration_status: item.registration_status ?? item.registrationStatus,
      modality_id: item.modality_id ?? item.modalityId ?? item.modality,
      company_id: item.company_id ?? item.companyId ?? item.company,
      apprentice_id: item.apprentice_id ?? item.apprenticeId ?? item.apprentice,
      uploaded_documents: item.uploaded_documents ?? item.uploadedDocuments,
      apprentice_observations: item.apprentice_observations ?? item.apprenticeObservations,
      admin_observations: item.admin_observations ?? item.adminObservations
    }))

    return {
      data: processed,
      total: response?.msg?.totalDocuments ?? processed.length
    }
  },
  buildPayload: (formData) => {
    const projectType = parseInt(formData.project_type)
    const payload = {
      modalityId: formData.modality_id,
      startDate: formData.scheduled_start_date,
      workingDays: parseInt(formData.working_days),
      dailyHours: parseInt(formData.daily_hours),
      senaRequiredArl: formData.sena_required_arl || false,
      projectType: projectType
    }

    // Solo enviar el campo que esté activo según la modalidad
    const hours = parseInt(formData.total_requested_hours) || 0
    const months = parseInt(formData.total_requested_months) || 0
    
    if (hours > 0) {
      payload.totalRequestedHours = hours
    } else if (months > 0) {
      payload.totalRequestedMonths = months
    } else {
      // Valor por defecto si ninguno está configurado
      payload.totalRequestedMonths = 6
    }

    if (formData.companyData && Object.keys(formData.companyData).length > 0) {
      payload.companyData = formData.companyData
    } else {
      payload.companyId = formData.company_id
    }

    return payload
  },
  messages: {
    createSuccess: 'Registro de EP creado exitosamente. Pendiente de validación administrativa.',
    updateSuccess: 'Registro actualizado exitosamente',
    listError: 'Error al cargar tus registros'
  }
})

// ==================== ESTADOS ADICIONALES ====================
const activeTab = ref('solicitudes')
const formRef = ref(null)
const newCompanyFormRef = ref(null)
const modalityOptions = ref([])
const companyOptionsForForm = ref([])
const allCompanies = ref([])
const showConfirmationDialog = ref(false)
const showCancellationDialog = ref(false)
const selectedFile = ref(null)
const showCompanyDialog = ref(false)

// Estados para pre-registro grupal
const showGroupDialog = ref(false)
const groupFormRef = ref(null)
const formDataGroup = ref({
  projectName: '',
  projectType: null,
  projectDescription: '',
  modality_id: '',
  company_id: '',
  scheduled_start_date: '',
  totalRequestedMonths: null,
  working_days: '',
  daily_hours: '',
  sena_required_arl: false,
  apprentices: [],
  companyData: null
})
const selectedApprentices = ref([])
const apprenticeSearch = ref('')
const userOwnDocument = ref('') // Documento del usuario logueado
const showBulkAddDialog = ref(false)
const bulkDocuments = ref('')

const projectTypeOptions = [
  { label: 'Proyecto Individual', value: 'individual' },
  { label: 'Proyecto Grupal', value: 'grupal' }
]

const formDataCompany = ref({
  companyNit: '',
  name: '',
  location: '',
  legalRepresentativePhone: '',
  legalRepresentativeName: '',
  legalRepresentativeEmail: '',
  legalRepresentativePosition: ''
})

const apprenticeName = computed(() => {
  const user = authStore.user
  return user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Aprendiz'
})

const columns = [
  { name: 'registration_number', label: 'Número Registro', field: 'registration_number', sortable: true, align: 'left' },
  { name: 'modality', label: 'Modalidad', field: 'modality', sortable: true, align: 'left' },
  { name: 'company', label: 'Empresa', field: 'company', sortable: true, align: 'left' },
  { name: 'scheduled_start_date', label: 'Fecha Inicio', field: 'scheduled_start_date', sortable: true, align: 'center' },
  { name: 'total_requested_hours', label: 'Horas Totales', field: 'total_requested_hours', sortable: true, align: 'center' },
  { name: 'registration_status', label: 'Estado', field: 'registration_status', sortable: true, align: 'center' },
  { name: 'opciones', label: 'Opciones', align: 'center' }
]

// ==================== COMPUTED PROPERTIES ====================
const isHoursBasedModality = computed(() => {
  if (!formDataRegistration.value.modality_id) return false
  const selectedModality = modalityOptions.value.find(m => m._id === formDataRegistration.value.modality_id)
  if (!selectedModality) return false
  
  return selectedModality.standardHours > 0
})

const isMonthsBasedModality = computed(() => {
  if (!formDataRegistration.value.modality_id) return false
  const selectedModality = modalityOptions.value.find(m => m._id === formDataRegistration.value.modality_id)
  if (!selectedModality) return false
  
  // Por ahora las modalidades del backend solo manejan horas
  // En el futuro se puede agregar campos como 'standardMonths' si es necesario
  const months = selectedModality.standardMonths || 0
    
  return months > 0
})

// ==================== FUNCIONES PERSONALIZADAS ====================
async function submitFormRegistration() {
  try {
    loading.value = true
    
    // Validar campos requeridos
    if (!formDataRegistration.value.modality_id) {
      notifications.error('Debe seleccionar una modalidad')
      return
    }
    
    if (!formDataRegistration.value.company_id && (!formDataRegistration.value.companyData || Object.keys(formDataRegistration.value.companyData).length === 0)) {
      notifications.error('Debe seleccionar o registrar una empresa')
      return
    }
    
    if (!formDataRegistration.value.scheduled_start_date) {
      notifications.error('Debe seleccionar la fecha de inicio programada')
      return
    }
    
    if (!formDataRegistration.value.working_days || parseInt(formDataRegistration.value.working_days) <= 0) {
      notifications.error('Debe ingresar los días laborales')
      return
    }
    
    if (!formDataRegistration.value.daily_hours || parseInt(formDataRegistration.value.daily_hours) <= 0) {
      notifications.error('Debe ingresar las horas diarias')
      return
    }
    
    // Validar que el usuario haya seleccionado un tipo de proyecto válido
    if (!formDataRegistration.value.project_type || (formDataRegistration.value.project_type !== 'individual' && formDataRegistration.value.project_type !== 'grupal')) {
      notifications.error('Debe seleccionar un tipo de proyecto válido')
      return
    }
    
    const projectType = formDataRegistration.value.project_type
    
    // Construir payload usando la función existente
    const payload = {
      modalityId: formDataRegistration.value.modality_id,
      startDate: formDataRegistration.value.scheduled_start_date,
      workingDays: parseInt(formDataRegistration.value.working_days) || 0,
      dailyHours: parseInt(formDataRegistration.value.daily_hours) || 0,
      senaRequiredArl: formDataRegistration.value.sena_required_arl || false,
      projectType: projectType
    }

    // Solo enviar el campo que esté activo según la modalidad
    const hours = parseInt(formDataRegistration.value.total_requested_hours) || 0
    const months = parseInt(formDataRegistration.value.total_requested_months) || 0
    
    if (hours > 0) {
      payload.totalRequestedHours = hours
    } else if (months > 0) {
      payload.totalRequestedMonths = months
    }

    if (formDataRegistration.value.companyData && Object.keys(formDataRegistration.value.companyData).length > 0) {
      payload.companyData = formDataRegistration.value.companyData
    } else {
      payload.companyId = formDataRegistration.value.company_id
    }

    // Usar postData directamente con savePreRegistration
    const result = await postData('preRegistrations/savePreRegistration', payload)
    
    notifications.success('Pre-registro guardado exitosamente. Pendiente de validación administrativa.')
    
    // Cerrar modal y refrescar datos
    closeFormDialogRegistration()
    await fetchRegistrations()
    
    return result
    
  } catch (error) {
    console.error('Error al guardar pre-registro:', error)
    
    // Extraer mensaje específico del backend
    let errorMessage = 'Error al guardar el pre-registro'
    
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      // Si hay un array de errores, mostrar el primer error o concatenar todos
      errorMessage = error.response.data.errors.join('. ')
    } else if (error.response?.data?.msg) {
      errorMessage = error.response.data.msg
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    notifications.error(errorMessage)
    throw error
  } finally {
    loading.value = false
  }
}

// ==================== WATCHERS ====================
watch(() => formDataRegistration.value.modality_id, async (newModalityId) => {
  if (newModalityId) {
    try {
      // Obtener los detalles completos de la modalidad del backend
      // Intentar primero con endpoint específico, si no existe usar el listado
      let modalityDetails
      try {
        modalityDetails = await getData(`modalities/getModality/${newModalityId}`)
      } catch {
        // Si no existe endpoint específico, usar los datos de la lista
        modalityDetails = modalityOptions.value.find(m => m._id === newModalityId)
      }
      
      if (modalityDetails) {
        const hours = modalityDetails.standardHours || modalityDetails.totalRequestedHours || 0
        const months = modalityDetails.standardMonths || modalityDetails.totalRequestedMonths || 0
        const workingDays = modalityDetails.workingDays || modalityDetails.working_days || 5
        const dailyHours = modalityDetails.dailyHours || modalityDetails.daily_hours || 8

        // Los campos working_days y daily_hours se mantienen vacíos para que el aprendiz los digite

        // Resetear ambos campos primero
        formDataRegistration.value.total_requested_hours = ''
        formDataRegistration.value.total_requested_months = ''

        // El tipo de proyecto se mantiene para que el usuario lo seleccione manualmente

        // Asignar el valor correspondiente según la modalidad
        if (hours > 0) {
          formDataRegistration.value.total_requested_hours = hours.toString()
        } else if (months > 0) {
          formDataRegistration.value.total_requested_months = months.toString()
        }
      }
    } catch (error) {
      // Fallback: usar datos básicos de la modalidad en la lista
      const selectedModality = modalityOptions.value.find(m => m._id === newModalityId)
      if (selectedModality) {
        const hours = selectedModality.standardHours || 0
        
        formDataRegistration.value.total_requested_hours = ''
        formDataRegistration.value.total_requested_months = ''
        
        if (hours > 0) {
          formDataRegistration.value.total_requested_hours = hours.toString()
        }
      }
    }
  }
})

// ==================== FUNCIONES DE UI ====================
function getStatusLabel(status) {
  return REGISTRATION_STATUS_LABELS[status] || 'Desconocido'
}

function getStatusColor(status) {
  const colors = {
    [REGISTRATION_STATUS.PENDING]: 'orange',
    [REGISTRATION_STATUS.REJECTED]: 'negative',
    [REGISTRATION_STATUS.APPROVED]: 'positive'
  }
  return colors[status] || 'grey'
}

function canEdit(record) {
  return record.registration_status === REGISTRATION_STATUS.PENDING ||
    record.registration_status === REGISTRATION_STATUS.REJECTED
}

function canSend(record) {
  if (!record) return false
  return record.registration_status === REGISTRATION_STATUS.PENDING ||
    record.registration_status === REGISTRATION_STATUS.REJECTED
}

function formatDate(date) {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// ==================== FUNCIONES DE CARGA ====================
async function loadModalities() {
  try {
    const payload = await getData('modalities/listModalities')
    let data = []

    if (payload?.modalities && Array.isArray(payload.modalities)) {
      data = payload.modalities
    } else if (payload?.msg && Array.isArray(payload.msg)) {
      data = payload.msg
    } else if (payload?.data && Array.isArray(payload.data)) {
      data = payload.data
    } else if (Array.isArray(payload)) {
      data = payload
    }

    modalityOptions.value = data.filter(item => item.status === 0)

    if (modalityOptions.value.length === 0) {
      notifications.warning('No hay modalidades activas disponibles. Contacta al administrador.')
    }
  } catch (error) {
    notifications.error('Error al cargar las modalidades. Por favor, recarga la página.')
  }
}

async function loadCompanies() {
  try {
    const payload = await getData('companies/listCompanies')
    let data = []

    if (payload?.msg?.companies && Array.isArray(payload.msg.companies)) {
      data = payload.msg.companies
    } else if (payload?.companies && Array.isArray(payload.companies)) {
      data = payload.companies
    } else if (payload?.msg && Array.isArray(payload.msg)) {
      data = payload.msg
    } else if (payload?.data && Array.isArray(payload.data)) {
      data = payload.data
    } else if (Array.isArray(payload)) {
      data = payload
    }

    allCompanies.value = data.filter(item => item)
    companyOptionsForForm.value = [...allCompanies.value]
  } catch (error) {
    notifications.error('Error al cargar las empresas: ' + error.message)
  }
}

function filterCompaniesForForm(val, update) {
  update(() => {
    if (!val || val.trim() === '') {
      companyOptionsForForm.value = [...allCompanies.value]
    } else {
      const needle = val.toLowerCase()
      companyOptionsForForm.value = allCompanies.value.filter(company => {
        const companyName = (company.name || '').toLowerCase()
        return companyName.startsWith(needle)
      })
    }
  })
}

// ==================== FUNCIONES DE EMPRESA ====================
function openFormDialogCompany() {
  formDataCompany.value = {
    companyNit: '',
    name: '',
    location: '',
    legalRepresentativePhone: '',
    legalRepresentativeName: '',
    legalRepresentativeEmail: '',
    legalRepresentativePosition: ''
  }
  showCompanyDialog.value = true
}

function closeFormDialogCompany() {
  showCompanyDialog.value = false
  if (newCompanyFormRef.value) {
    newCompanyFormRef.value.resetValidation()
  }
}

async function submitFormCompany() {
  if (!newCompanyFormRef.value) return

  const isValid = await newCompanyFormRef.value.validate()
  if (!isValid) {
    notifications.error('Por favor completa todos los campos')
    return
  }

  try {
    // Determinar si estamos en modal individual o grupal
    if (showAddDialog.value || showDetailDialog.value) {
      // Modal individual
      formDataRegistration.value.companyData = { ...formDataCompany.value }
      formDataRegistration.value.company_id = ''
    } else if (showGroupDialog.value) {
      // Modal grupal
      formDataGroup.value.companyData = { ...formDataCompany.value }
      formDataGroup.value.company_id = ''
    }

    notifications.success(`Empresa "${formDataCompany.value.name}" registrada temporalmente.`)
    closeFormDialogCompany()
  } catch (error) {
    notifications.error('Error al registrar la empresa')
  }
}

// ==================== FUNCIONES DE PRE-REGISTRO GRUPAL ====================
function openFormDialogGroupRegistration() {
  // Resetear formulario
  formDataGroup.value = {
    projectName: '',
    projectType: null,
    projectDescription: '',
    modality_id: '',
    company_id: '',
    scheduled_start_date: '',
    totalRequestedMonths: null,
    working_days: '',
    daily_hours: '',
    sena_required_arl: false,
    apprentices: [],
    companyData: null
  }
  selectedApprentices.value = []
  apprenticeSearch.value = ''
  userOwnDocument.value = '' // Limpiar documento del usuario
  showBulkAddDialog.value = false
  bulkDocuments.value = ''
  showGroupDialog.value = true
}

function closeFormDialogGroupRegistration() {
  showGroupDialog.value = false
  if (groupFormRef.value) {
    groupFormRef.value.resetValidation()
  }
}

// Funciones simplificadas para manejar documentos como strings
function searchApprenticeByDocument(document) {
  // Función obsoleta - usar addApprenticeByDocument directamente
  addApprenticeByDocument(document)
}

function removeApprenticeFromSelection(documentToRemove) {
  selectedApprentices.value = selectedApprentices.value.filter(doc => doc !== documentToRemove)
  notifications.info(`Removido: ${documentToRemove}`)
}

// Función removida - usar addApprenticeByDocument directamente

function addMultipleApprentices() {
  if (!bulkDocuments.value || !bulkDocuments.value.trim()) {
    notifications.warning('Debe ingresar al menos un documento')
    return
  }
  
  // Separar por comas, espacios o saltos de línea
  const documents = bulkDocuments.value
    .split(/[,\n\s]+/)
    .map(doc => doc.trim())
    .filter(doc => doc.length >= 6)
  
  if (documents.length === 0) {
    notifications.warning('No se encontraron documentos válidos (mínimo 6 caracteres cada uno)')
    return
  }
  
  let added = 0
  let duplicates = 0
  let invalid = 0
  
  // Agregar documentos
  for (const document of documents) {
    const validation = validateDocumentFormat(document)
    
    if (!validation.valid) {
      invalid++
      continue
    }
    
    const cleanDocument = validation.document
    const alreadySelected = selectedApprentices.value.includes(cleanDocument)
    
    if (alreadySelected) {
      duplicates++
      continue
    }
    
    selectedApprentices.value.push(cleanDocument)
    added++
  }
  
  // Cerrar diálogo
  showBulkAddDialog.value = false
  bulkDocuments.value = ''
  
  // Mostrar resultados
  if (added > 0) {
    notifications.success(`${added} documento${added > 1 ? 's' : ''} agregado${added > 1 ? 's' : ''} al grupo`)
  }
  
  if (duplicates > 0) {
    notifications.info(`${duplicates} documento${duplicates > 1 ? 's' : ''} ya estaba${duplicates > 1 ? 'n' : ''} en el grupo`)
  }
  
  if (invalid > 0) {
    notifications.warning(`${invalid} documento${invalid > 1 ? 's' : ''} con formato inválido ignorado${invalid > 1 ? 's' : ''}`)
  }
}

// Función de revalidación removida - no necesaria con enfoque simplificado

// Función para intentar validar un documento
// Función simple para validar formato de documento
function validateDocumentFormat(document) {
  const cleanDocument = document.toString().trim().replace(/[^0-9]/g, '')
  
  if (!cleanDocument) {
    return { valid: false, message: 'Documento vacío' }
  }
  
  if (cleanDocument.length < 6 || cleanDocument.length > 12) {
    return { valid: false, message: 'El documento debe tener entre 6 y 12 dígitos' }
  }
  
  return { valid: true, document: cleanDocument }
}

// Función de validación duplicada removida

// Validar documento con feedback visual
// Función simplificada para agregar aprendices manualmente
const addApprentice = () => {
  if (!apprenticeSearch.value || !apprenticeSearch.value.trim()) {
    notifications.error('Ingrese el número de documento')
    return
  }
  
  const document = apprenticeSearch.value.trim()
  addApprenticeByDocument(document)
  apprenticeSearch.value = ''
}

// Función para remover un aprendiz de la lista
const removeApprentice = (index) => {
  const document = selectedApprentices.value[index]
  selectedApprentices.value.splice(index, 1)
  notifications.info(`Removido documento: ${document}`)
}

// Función para limpiar toda la lista
const clearAllApprentices = () => {
  if (selectedApprentices.value.length === 0) {
    notifications.info('La lista ya está vacía')
    return
  }
  
  $q.dialog({
    title: 'Limpiar Lista',
    message: `¿Remover todos los ${selectedApprentices.value.length} compañero(s) de la lista?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    const count = selectedApprentices.value.length
    selectedApprentices.value = []
    notifications.success(`Removidos ${count} compañero(s)`)
  })
}



// Función de prueba rápida para documentos
const testDocument = async (testDoc = '10000001') => {
  console.log(`🧪 Probando documento: ${testDoc}`)
  
  try {
    // Probar directamente la ruta que mencionas
    console.log(`🔗 Probando ruta: apprentices/listApprentice?search=${testDoc}`)
    const directResult = await getData(`apprentices/listApprentice?search=${testDoc}`)
    console.log('📋 Resultado directo:', directResult)
    
    // También probar con nuestra función de validación
    const validation = await validateApprenticeDocument(testDoc)
    console.log('🔍 Resultado de validación:', validation)
    
    $q.dialog({
      title: 'Resultado de Prueba de Documento',
      message: `
        <div class="q-mb-md"><strong>📄 Documento probado:</strong> ${testDoc}</div>
        <div class="q-mb-md"><strong>🔗 Ruta probada:</strong> apprentices/listApprentice?search=${testDoc}</div>
        <hr>
        <div class="q-mb-sm"><strong>📋 Respuesta directa:</strong></div>
        <pre class="text-xs q-mb-md">${JSON.stringify(directResult, null, 2)}</pre>
        <hr>
        <div class="q-mb-sm"><strong>🔍 Resultado de validación:</strong></div>
        <div><strong>Válido:</strong> ${validation.valid ? '✅ SI' : '❌ NO'}</div>
        <div><strong>Método:</strong> ${validation.method}</div>
        <div><strong>Confianza:</strong> ${validation.confidence || 0}%</div>
        ${validation.message ? `<div><strong>Mensaje:</strong> ${validation.message}</div>` : ''}
        ${validation.data ? `<div class="q-mb-sm"><strong>Datos del aprendiz:</strong></div><pre class="text-xs">${JSON.stringify(validation.data, null, 2)}</pre>` : ''}
      `,
      html: true,
      ok: true,
      style: 'max-width: 800px'
    })
  } catch (error) {
    console.error('❌ Error en prueba:', error)
    
    $q.dialog({
      title: '❌ Error en Prueba',
      message: `
        <div><strong>Documento:</strong> ${testDoc}</div>
        <div><strong>Error:</strong> ${error.message}</div>
        <div><strong>Status:</strong> ${error.response?.status || 'N/A'}</div>
        <div><strong>Response:</strong></div>
        <pre class="text-xs">${JSON.stringify(error.response?.data, null, 2)}</pre>
      `,
      html: true,
      ok: true
    })
  }
}

// Función simple para testing si es necesario
window.testAddDocument = (doc = '10000001') => {
  console.log(`🧪 Probando agregar documento: ${doc}`)
  return addApprenticeByDocument(doc)
}

// Función simple para agregar un compañero por documento
function addApprenticeByDocument(document) {
  const validation = validateDocumentFormat(document)
  
  if (!validation.valid) {
    notifications.error(`❌ ${validation.message}`)
    return false
  }
  
  const cleanDocument = validation.document
  
  // Verificar si ya está agregado
  const alreadySelected = selectedApprentices.value.find(a => a === cleanDocument)
  if (alreadySelected) {
    notifications.warning('Este documento ya está agregado')
    return false
  }
  
  // Verificar que no sea el documento del usuario actual
  const currentUserDoc = authStore.user?.document || authStore.user?.documentNumber
  if (currentUserDoc && currentUserDoc.toString() === cleanDocument) {
    notifications.warning('No puedes agregarte a ti mismo al grupo')
    return false
  }
  
  // Agregar documento como string simple
  selectedApprentices.value.push(cleanDocument)
  notifications.success(`✅ Documento ${cleanDocument} agregado al grupo`)
  
  return true
}

async function submitFormGroupRegistration() {
  console.log('🚀 Iniciando registro grupal...')
  
  if (!groupFormRef.value) {
    console.error('❌ groupFormRef no está disponible')
    notifications.error('Error: Referencia del formulario no encontrada')
    return
  }

  console.log('📝 Validando formulario...')
  const isValid = await groupFormRef.value.validate()
  if (!isValid) {
    console.error('❌ Formulario no es válido')
    notifications.error('Por favor complete todos los campos correctamente')
    return
  }

  if (selectedApprentices.value.length < 1) {
    console.error('❌ No hay compañeros agregados')
    notifications.error('Debe agregar al menos 1 compañero para un registro grupal')
    return
  }
  
  console.log('✅ Validaciones pasadas')
  console.log('📋 Datos del formulario:', formDataGroup.value)
  console.log('👥 Compañeros seleccionados:', selectedApprentices.value)

  // Declarar payload fuera del try para que esté disponible en el catch
  let payload = null
  
  try {
    loading.value = true
    console.log('⏳ Loading activado...')

    // Usar el documento ingresado por el usuario
    const currentUserDocument = userOwnDocument.value?.trim()
    
    console.log('📝 Documento ingresado por el usuario:', currentUserDocument)
    console.log('📝 Compañeros seleccionados:', selectedApprentices.value)
    
    if (!currentUserDocument || currentUserDocument.length < 6) {
      notifications.error('Debes ingresar tu número de documento (mínimo 6 dígitos)')
      return
    }
    
    // Validar formato del documento del usuario
    const userDocValidation = validateDocumentFormat(currentUserDocument)
    if (!userDocValidation.valid) {
      notifications.error('Documento inválido: ' + userDocValidation.message)
      return
    }
    
    const allApprentices = [currentUserDocument, ...selectedApprentices.value]
    console.log('👥 Array completo ANTES del filtro:', allApprentices)
    
    // Verificar qué documentos son válidos
    allApprentices.forEach((doc, index) => {
      console.log(`👤 Persona ${index + 1}: "${doc}" (tipo: ${typeof doc}, válido: ${doc && doc.toString().trim().length > 0})`)
    })
    
    // Filtrar documentos válidos
    const validApprentices = allApprentices.filter(doc => doc && doc.toString().trim().length > 0)
    
    console.log('✅ Documentos válidos después del filtro:', validApprentices)
    console.log('📊 Total personas válidas:', validApprentices.length)
    
    // Construir payload con validaciones más estrictas
    payload = {
      projectName: formDataGroup.value.projectName?.trim() || '',
      projectType: 'grupal',
      projectDescription: formDataGroup.value.projectDescription?.trim() || '',
      totalRequestedMonths: parseInt(formDataGroup.value.totalRequestedMonths) || 6,
      startDate: formDataGroup.value.scheduled_start_date || null,
      workingDays: parseInt(formDataGroup.value.working_days) || 5,
      dailyHours: parseInt(formDataGroup.value.daily_hours) || 8,
      senaRequiredArl: Boolean(formDataGroup.value.sena_required_arl),
      apprentices: validApprentices,
      modalityId: formDataGroup.value.modality_id || null,
      companyId: formDataGroup.value.company_id || null
    }
    
    // Validaciones adicionales del payload
    if (!payload.projectName) {
      notifications.error('Falta el nombre del proyecto')
      return
    }
    if (!payload.modalityId) {
      notifications.error('Debe seleccionar una modalidad')
      return
    }
    if (!payload.companyId) {
      notifications.error('Debe seleccionar una empresa')
      return
    }
    if (!payload.startDate) {
      notifications.error('Debe seleccionar la fecha de inicio')
      return
    }
    if (validApprentices.length < 2) {
      notifications.error(`Se necesitan mínimo 2 personas. Tienes: ${validApprentices.length} (tu documento + ${selectedApprentices.value.length} compañero${selectedApprentices.value.length > 1 ? 's' : ''})`)
      return
    }
    
    console.log('🎯 ENVIANDO PAYLOAD CON DOCUMENTO INGRESADO POR EL USUARIO')

    console.log('📦 Payload completo:', payload)
    console.log('🌐 Enviando a: projectPreRegistrations/saveProjectPreRegistration')
    
    // Enviar al backend usando la ruta exacta que especificaste
    const result = await postData('projectPreRegistrations/saveProjectPreRegistration', payload)
    
    console.log('✅ Respuesta del backend:', result)
    console.log('🎉 Registro exitoso - mostrando notificación...')
    
    notifications.success('Pre-registro grupal guardado exitosamente')
    
    console.log('🔄 Cerrando modal...')
    closeFormDialogGroupRegistration()
    
    console.log('🔄 Refrescando registros...')
    await fetchRegistrations()
    
    console.log('✅ Proceso completo finalizado')
    return result
    
  } catch (error) {
    // Información detallada del error del backend
    const errorDetails = error.response?.data || {}
    const statusCode = error.response?.status || 'desconocido'
    
    // Extraer el mensaje de error del backend
    let errorMessage = 'Error al guardar el pre-registro grupal'
    
    if (errorDetails.message) {
      errorMessage = errorDetails.message
    } else if (errorDetails.msg) {
      errorMessage = errorDetails.msg  
    } else if (errorDetails.error) {
      errorMessage = errorDetails.error
    } else if (Array.isArray(errorDetails.errors)) {
      errorMessage = errorDetails.errors.join(', ')
    } else if (errorDetails.errors) {
      errorMessage = JSON.stringify(errorDetails.errors)
    } else if (error.message) {
      errorMessage = error.message
    }
    
    // Mostrar error limpio en notificación
    notifications.error(errorMessage)
    
    // Log detallado para debugging (solo en consola)
    console.error('❌ ========== ERROR BACKEND DETALLADO ==========')
    console.error('🚨 Status Code:', statusCode)  
    console.error('💬 Mensaje:', errorMessage)
    console.error('📦 Payload enviado:', payload ? JSON.stringify(payload, null, 2) : 'No disponible')
    console.error('🌐 Response completa:', errorDetails)
    console.error('❌ ========================================')
  } finally {
    console.log('🔄 Finally block - desactivando loading...')
    loading.value = false
    console.log('✅ Loading desactivado')
  }
  
  // Validación simplificada - todos los documentos ya tienen formato válido

  // Validaciones adicionales específicas (similares al individual)
  if (!formDataGroup.value.modality_id) {
    notifications.error('Debe seleccionar una modalidad')
    return
  }
  
  if (!formDataGroup.value.company_id && (!formDataGroup.value.companyData || Object.keys(formDataGroup.value.companyData).length === 0)) {
    notifications.error('Debe seleccionar o registrar una empresa')
    return
  }
  
  if (!formDataGroup.value.scheduled_start_date) {
    notifications.error('Debe seleccionar la fecha de inicio programada')
    return
  }
  
  if (!formDataGroup.value.working_days || parseInt(formDataGroup.value.working_days) <= 0) {
    notifications.error('Debe ingresar los días laborales')
    return
  }
  
  if (!formDataGroup.value.daily_hours || parseInt(formDataGroup.value.daily_hours) <= 0) {
    notifications.error('Debe ingresar las horas diarias')
    return
  }

  // En el registro grupal, siempre es tipo 'grupal'
  const projectType = 'grupal'

  const totalMonths = parseInt(formDataGroup.value.totalRequestedMonths)
  if (isNaN(totalMonths) || totalMonths <= 0) {
    notifications.error('Los meses solicitados deben ser mayor a 0')
    return
  }
  
  if (!formDataGroup.value.projectDescription || formDataGroup.value.projectDescription.trim().length < 10) {
    notifications.error('La descripción del proyecto debe tener al menos 10 caracteres')
    return
  }

  try {
    loading.value = true
    console.log('⏳ Loading activado...')
    console.log('🚀 Enviando directamente al backend sin confirmación...')

    // Incluir el documento del usuario logueado junto con los compañeros
    const currentUserDoc = authStore.user?.document || authStore.user?.documentNumber || userOwnDocument.value
    console.log('📝 Documento del usuario logueado:', currentUserDoc)
    const allApprentices = [currentUserDoc, ...selectedApprentices.value]
    console.log('👥 Todos los aprendices (usuario + compañeros):', allApprentices)
    
    // Construir payload según la estructura EXACTA que espera el backend
    const payload = {
      projectName: formDataGroup.value.projectName.trim(),
      projectType: 1, // Número 1 para grupal (como espera el backend)
      projectDescription: formDataGroup.value.projectDescription.trim(),
      totalRequestedMonths: totalMonths,
      startDate: formDataGroup.value.scheduled_start_date,
      companyId: formDataGroup.value.company_id,
      modalityId: formDataGroup.value.modality_id,
      // Solo los compañeros, NO incluir tu documento (el backend ya sabe quién envía)
      apprentices: selectedApprentices.value
    }

    // Manejar empresa nueva si existe
    if (formDataGroup.value.companyData && Object.keys(formDataGroup.value.companyData).length > 0) {
      payload.companyData = formDataGroup.value.companyData
      delete payload.companyId // Remover companyId si hay companyData
    }

    console.log('📦 Payload completo:', payload)
    console.log('🌐 Enviando al backend...')
    
    // Enviar al backend usando el endpoint específico para pre-registros grupales
    const result = await postData('projectPreRegistrations/saveProjectPreRegistration', payload)
    
    console.log('✅ Respuesta del backend:', result)
    console.log('🎉 Registro exitoso - mostrando notificación...')
    
    notifications.success('Pre-registro grupal guardado exitosamente. Pendiente de validación administrativa.')
    
    console.log('🔄 Cerrando modal...')
    // Cerrar modal y refrescar datos
    closeFormDialogGroupRegistration()
    
    console.log('🔄 Refrescando registros...')
    await fetchRegistrations()
    
    console.log('✅ Proceso completo finalizado')
    return result
    
  } catch (error) {
    console.error('❌ Error en el registro grupal:', error)
    
    // Extraer mensaje específico del backend para la notificación
    let errorMessage = 'Error al guardar el pre-registro grupal'
    
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      errorMessage = error.response.data.errors.join('. ')
    } else if (error.response?.data?.msg) {
      errorMessage = error.response.data.msg
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    // Mejorar mensaje específico para pre-registros existentes
    if (errorMessage.includes('preRegistro en proceso de revisión')) {
      errorMessage = '⚠️ No se puede crear el grupo: Uno o más integrantes ya tienen un pre-registro pendiente de aprobación. Verifica que todos los documentos sean de personas sin registros activos.'
    }
    
    // Solo mostrar notificación, sin diálogos adicionales
    notifications.error(errorMessage)
    throw error
  } finally {
    console.log('🔄 Finally block - desactivando loading...')
    loading.value = false
    console.log('✅ Loading desactivado')
  }
}

// ==================== FUNCIONES ESPECIALES DE REGISTRO ====================
async function handleSubmitAndSend() {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    notifications.error('Por favor complete todos los campos correctamente')
    return
  }

  try {
    await submitFormRegistration()
    notifications.info('El registro fue creado y enviado para validación administrativa')
  } catch (error) {
    // El error ya se maneja en submitFormRegistration
  }
}

function handleSendFromModal() {
  $q.dialog({
    title: '¿Enviar registro a validación?',
    message: '¿Estás seguro de enviar este registro al administrador para su validación?',
    cancel: { label: 'Cancelar', color: 'negative', flat: true },
    ok: { label: 'Enviar', color: 'primary' },
    persistent: true
  }).onOk(async () => {
    try {
      loading.value = true
      const validationData = {
        registration_status: REGISTRATION_STATUS.PENDING,
        admin_observations: 'Registro enviado para validación'
      }

      await putData(`registrations/validateRegistration?apprentice=${formDataRegistration.value._id}`, validationData)
      notifications.success('Registro enviado exitosamente para validación')
      closeFormDialogRegistration()
      await fetchRegistrations()
    } catch (error) {
      const errorMessage = error.response?.data?.message
        || error.response?.data?.msg
        || error?.message
        || 'Error al enviar el registro'
      notifications.error(errorMessage)
    } finally {
      loading.value = false
    }
  })
}

// ==================== FUNCIONES DE VALIDACIÓN DE DOCUMENTOS ====================
async function submitDocuments() {
  if (!selectedFile.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor selecciona un archivo',
      position: 'top'
    })
    return
  }

  try {
    loading.value = true

    const formData = new FormData()
    formData.append('documento', selectedFile.value)

    await new Promise(resolve => setTimeout(resolve, 2000))

    $q.notify({
      type: 'positive',
      message: 'Documento enviado exitosamente',
      position: 'top'
    })

    closeConfirmationDialog()
    resetDocumentForm()

  } catch (err) {
    console.error('Error al enviar documentos:', err)
    $q.notify({
      type: 'negative',
      message: err?.response?.data?.message || 'Error al enviar el documento',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

function handleFileChange(file) {
  if (file) {
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      $q.notify({
        type: 'warning',
        message: 'El archivo excede el tamaño máximo permitido (10MB)',
        position: 'top'
      })
      selectedFile.value = null
      return
    }

    const allowedTypes = ['application/pdf']

    if (!allowedTypes.includes(file.type)) {
      $q.notify({
        type: 'warning',
        message: 'Tipo de archivo no permitido. Solo se aceptan PDF',
        position: 'top'
      })
      selectedFile.value = null
    }
  }
}

function openConfirmationDialog() {
  if (!selectedFile.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor selecciona un archivo antes de continuar',
      position: 'top'
    })
    return
  }
  showConfirmationDialog.value = true
}

function closeConfirmationDialog() {
  showConfirmationDialog.value = false
}

function closeCancellationDialog() {
  showCancellationDialog.value = false
}

function confirmCancel() {
  resetDocumentForm()
  closeCancellationDialog()
}

function handleCancel() {
  if (selectedFile.value) {
    showCancellationDialog.value = true
  }
}

function resetDocumentForm() {
  selectedFile.value = null
}

// ==================== LIFECYCLE ====================
onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.token) {
    notifications.error('No estás autenticado. Por favor inicia sesión nuevamente.')
    router.push('/').catch(() => { })
    return
  }

  await Promise.all([
    fetchRegistrations(),
    loadModalities(),
    loadCompanies()
  ])
})
</script>

<style scoped>
.pre-registration-page {
  background: #f5f7fb;
  min-height: 100vh;
}

.hero-card {
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f2fbf7 100%);
}

/* Responsividad para PageHeader */
:deep(.hero-card .q-card-section) {
  padding: 20px;
}

@media (max-width: 480px) {
  :deep(.hero-card .q-card-section) {
    padding: 15px;
  }
}

@media (max-width: 320px) {
  :deep(.hero-card .q-card-section) {
    padding: 12px;
  }
}

.tabs-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.tab-btn {
  min-width: 200px;
  padding: 12px 30px;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 500;
  background: #d9d9d9;
  color: #000;
  transition: 0.3s;
}

.tab-btn:hover {
  background: #c0c0c0;
}

.tab-btn.active {
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-content {
  padding: 25px 20px;
}

.message-section {
  text-align: center;
}

.message-text {
  font-size: 15px;
  color: #5f6368;
  line-height: 1.6;
}

.recommendation-box {
  background: #fff3cd;
  border-left: 6px solid #ffc107;
  border-radius: 8px;
  padding: 15px;
}

.recommendation-content {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.recommendation-text {
  font-size: 14px;
  color: #856404;
  line-height: 1.6;
  flex: 1;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.upload-label-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.upload-label {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  line-height: 1.2;
}

.upload-sublabel {
  font-size: 12px;
  color: #666;
  line-height: 1.2;
}

.upload-input-group {
  width: 280px;
}

.custom-file-input {
  width: 100%;
}

.file-info-box {
  background: #e8f5e9;
  border-left: 4px solid #44b900;
  padding: 12px 15px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  font-size: 13px;
  font-weight: 600;
  color: #1b5e20;
}

.file-size {
  font-size: 12px;
  color: #666;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.confirmation-text {
  color: #5f6368;
  line-height: 1.6;
}

.tab-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsividad para tablets */
@media (max-width: 768px) {
  .pre-registration-page {
    padding: 0.5rem;
  }

  .hero-card {
    border-radius: 15px;
    margin-bottom: 1.5rem;
  }

  .tabs-container {
    gap: 15px;
    margin-bottom: 20px;
  }

  .tab-btn {
    min-width: 180px;
    padding: 10px 25px;
    font-size: 14px;
  }

  .container {
    padding: 0 10px;
  }

  /* Responsividad para barra de búsqueda en tablet */
  .row.items-center.q-mb-md.q-gutter-sm {
    gap: 12px;
  }

  .upload-input-group {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }

  .form-actions button {
    width: 100%;
  }

  .recommendation-box {
    padding: 12px;
  }

  .section-content {
    padding: 20px 15px;
  }
}

/* Responsividad para móviles */
@media (max-width: 480px) {
  .pre-registration-page {
    padding: 0.25rem;
  }

  .hero-card {
    border-radius: 12px;
    margin-bottom: 1rem;
  }

  .tabs-container {
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    padding: 0 10px;
  }

  .tab-btn {
    min-width: 100%;
    max-width: 280px;
    padding: 12px 20px;
    font-size: 13px;
  }

  .container {
    padding: 0 5px;
  }

  /* Responsividad para barra de búsqueda */
  .row.items-center.q-mb-md.q-gutter-sm {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .row.items-center.q-mb-md.q-gutter-sm > div {
    width: 100%;
    margin: 0;
  }

  .col-12.col-md-3,
  .col-auto {
    flex: none;
    width: 100%;
    max-width: 100%;
  }

  .section-content {
    padding: 15px 10px;
  }

  .message-text {
    font-size: 14px;
  }

  .upload-label {
    font-size: 13px;
  }

  .recommendation-text {
    font-size: 13px;
  }

  .recommendation-box {
    padding: 10px;
  }

  .form-actions {
    margin-top: 20px;
  }

  .upload-section {
    gap: 12px;
  }

  .upload-label-group {
    text-align: center;
  }
}

/* Responsividad para dispositivos muy pequeños (300px - 400px) */
@media (max-width: 400px) {
  .pre-registration-page {
    padding: 0.125rem;
  }

  .hero-card {
    border-radius: 10px;
    margin-bottom: 0.75rem;
  }

  .tabs-container {
    padding: 0 5px;
    margin-bottom: 10px;
  }

  .tab-btn {
    padding: 10px 15px;
    font-size: 12px;
    border-radius: 25px;
  }

  .container {
    padding: 0;
  }

  /* Barra de búsqueda en pantallas muy pequeñas */
  .q-pa-md {
    padding: 8px !important;
  }

  .row.items-center.q-mb-md.q-gutter-sm {
    margin-bottom: 12px;
    gap: 8px;
  }

  .section-content {
    padding: 12px 8px;
  }

  .message-text {
    font-size: 13px;
  }

  .recommendation-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
  }

  .recommendation-text {
    font-size: 12px;
  }

  .recommendation-box {
    padding: 8px;
  }

  .upload-label {
    font-size: 12px;
  }

  .upload-sublabel {
    font-size: 11px;
  }

  .file-name {
    font-size: 12px;
  }

  .file-size {
    font-size: 11px;
  }

  .file-info-box {
    padding: 10px 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  /* Ajustes específicos para la tabla en móviles muy pequeños */
  :deep(.q-table) {
    font-size: 12px;
  }

  :deep(.q-table th) {
    padding: 8px 4px;
    font-size: 11px;
  }

  :deep(.q-table td) {
    padding: 8px 4px;
    font-size: 12px;
  }

  :deep(.q-btn) {
    min-height: 32px;
  }

  :deep(.q-input) {
    font-size: 14px;
  }
}

/* Responsividad extrema para 300px */
@media (max-width: 320px) {
  .pre-registration-page {
    padding: 0;
  }

  .hero-card {
    margin-bottom: 0.5rem;
    border-radius: 8px;
  }

  .tabs-container {
    margin-bottom: 8px;
    padding: 0 2px;
  }

  .tab-btn {
    padding: 8px 12px;
    font-size: 11px;
    min-width: 100%;
  }

  .section-content {
    padding: 10px 6px;
  }

  /* Barra de búsqueda responsive extrema */
  .q-pa-md {
    padding: 6px !important;
  }

  .row.items-center.q-mb-md.q-gutter-sm {
    margin-bottom: 8px;
    gap: 6px;
  }

  /* Inputs y botones más pequeños */
  :deep(.q-input) {
    font-size: 12px;
  }

  :deep(.q-input .q-field__label) {
    font-size: 11px;
  }

  :deep(.q-input .q-field__control) {
    min-height: 36px;
  }

  .message-text {
    font-size: 12px;
    line-height: 1.4;
  }

  .recommendation-text {
    font-size: 11px;
    line-height: 1.4;
  }

  .upload-label {
    font-size: 11px;
  }

  .upload-sublabel {
    font-size: 10px;
  }

  .form-actions {
    gap: 8px;
    margin-top: 15px;
  }

  /* Ajustes para inputs en pantallas muy pequeñas */
  :deep(.q-input .q-field__control) {
    min-height: 40px;
  }

  :deep(.q-btn) {
    min-height: 36px;
    font-size: 12px;
    padding: 8px 16px;
  }

  /* Tabla responsiva extrema */
  :deep(.q-table) {
    font-size: 11px;
  }

  :deep(.q-table th),
  :deep(.q-table td) {
    padding: 6px 2px;
    font-size: 10px;
  }

  :deep(.q-table .q-btn) {
    min-width: 30px;
    min-height: 30px;
    padding: 4px;
  }

  /* Ocultar columnas menos importantes en pantallas muy pequeñas */
  :deep(.q-table th:nth-child(3)),
  :deep(.q-table td:nth-child(3)),
  :deep(.q-table th:nth-child(4)),
  :deep(.q-table td:nth-child(4)) {
    display: none;
  }
}

/* Estilos para el pre-registro grupal */
.apprentices-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.search-section {
  background: white;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #e0e0e0;
}

.found-apprentice {
  animation: slideDown 0.3s ease-in-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.selected-apprentices {
  background: white;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #e0e0e0;
}

.apprentice-card {
  transition: all 0.2s ease;
}

.apprentice-card:hover {
  background-color: #f5f5f5;
}

.apprentices-list {
  max-height: 200px;
  overflow-y: auto;
}

.current-user-card {
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
  border-left: 4px solid var(--q-primary);
}

.current-user-card .text-subtitle2 {
  font-weight: 600;
  color: var(--q-primary);
}

.modal-column {
  padding: 0 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 20px 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e3f2fd;
}

.modal-column:first-child .section-title:first-child {
  margin-top: 0;
}

/* Responsividad para el modal grupal */
@media (max-width: 768px) {
  .apprentices-section {
    padding: 12px;
  }
  
  .modal-column {
    padding: 0 4px;
  }
  
  .section-title {
    font-size: 14px;
    margin: 15px 0 10px 0;
  }
}

@media (max-width: 480px) {
  .apprentices-section {
    padding: 8px;
  }
  
  .section-title {
    font-size: 13px;
    margin: 12px 0 8px 0;
  }
}
</style>