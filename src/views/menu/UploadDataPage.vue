<template>
  <div v-if="isLoading">
    <div class="loader"></div>
    <div class="loader-text">Processing...</div>
  </div>
  <div class="contain background">
    <div class="top">
      <div class="left">
        <div class="title">
          *Upload File with format .XLS
        </div>
        <div class="example">
          <div class="text">*Please use this format for your excel to Input Price List</div>
          <div class="example-table">
            <table class="table table-hover table-bordered table-striped">
              <thead>
                <tr class="align-middle">
                  <th scope="col-1" class="table-number">id</th>
                  <th scope="col" class="table-part-number">sparepart_number</th>
                  <th scope="col" class="table-name">sparepart_name</th>
                  <th scope="col" class="table-price">purchase_price</th>
                  <th scope="col" class="table-seller">seller</th>
                  <th scope="col" class="table-discount">branch</th>
                </tr>
              </thead>
              <tbody>
                <tr class="align-middle">
                  <td scope="col-1" class="table-number">optional</td>
                  <td scope="col" class="table-part-number">required</td>
                  <td scope="col" class="table-name">required</td>
                  <td scope="col" class="table-price">required</td>
                  <td scope="col" class="table-seller">required</td>
                  <td scope="col" class="table-discount">optional</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="seller">
          *Input seller : <br>
          &emsp; 1 -> if seller "MHI" <br>
          &emsp; 2 -> if seller "CT", <br>
          &emsp; 3 -> if seller "Aseng" <br>
        </div>
        <div class="branch">*Input branch : <br>
          &emsp; SMG -> if branch "Semarang" <br>
          &emsp; JKT -> if branch "Jakarta", <br>
          If you don't input branch, the default value is "SMG"
        </div>
      </div>
    </div>
    <div class="upload">
      <form action="/updateAllData" class="dropzone" id="upload-dropzone">
        <input type="file" id="inputFile" hidden @change="handleFileUpload" @click="$event.target.value = ''">

      </form>
      <div class="file">{{ files }}</div>
      <div class="submit">
        <button class="btn btn-outline-dark" @click="uploadFiles">
          Upload
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getToken } from '@/utils/local-storage'
// import ProgressBar from '@/components/ProgressBar.vue'
import * as XLSX from 'xlsx'
import Dropzone from 'dropzone'
import 'dropzone/dist/dropzone.css'
import { useModalStore } from '@/stores/modal'

const modalStore = useModalStore()
const isLoading = ref(false)
const files = ref(null)
const startTime = ref(null)

let dropzone = null

onMounted(() => {
  Dropzone.autoDiscover = false

  const token = `Bearer ${getToken('token-bmj')}`

  dropzone = new Dropzone('#upload-dropzone', {
    url: 'http://localhost:8000/api/sparepart/updateAllData',
    method: 'post',
    headers: {
      'key': 'rest-api-test',
      'Authorization': token
    },
    withCredentials: true,
    forceChunking: true,
    chunking: true,
    chunkSize: 2000000, // 2MB per chunk
    parallelChunkUploads: false,
    autoProcessQueue: false, // disables automatic upload
    addRemoveLinks: true,
  })

  dropzone.on('addedfile', async (file) => {
    isLoading.value = true
    try {
      await handleFileUpload(file)
      files.value = file.name
      modalStore.openMessageModal('Success', 'File is valid and ready to upload')
    } catch (err) {
      modalStore.openMessageModal('Failed', err.message || 'Invalid file')
      dropzone.removeFile(file)
    } finally {
      isLoading.value = false
    }
  })

  dropzone.on('removedfile', (file, response) => {
    files.value = null
  })

  dropzone.on('success', (file, response) => {
    isLoading.value = false
    const finishTime = Date.now()
    const elapsedSeconds = Math.round((finishTime - startTime.value) / 1000)
    console.log(`Upload completed in ${elapsedSeconds} seconds`)
    const { new_records, updated_records } = response.data
    modalStore.openMessageModal('Success', `New Records: ${new_records}, Updated Records: ${updated_records}, in ${elapsedSeconds} seconds`)
    console.log(response.message, response)
  })

  dropzone.on('error', (file, errorMessage) => {
    isLoading.value = false
    console.error('Upload error:', errorMessage)
    modalStore.openMessageModal('Failed', errorMessage)
  })
})

function uploadFiles() {
  if (dropzone && dropzone.getQueuedFiles().length > 0) {
    isLoading.value = true
    startTime.value = Date.now()
    dropzone.processQueue()
  } else {
    modalStore.openMessageModal('Failed', 'No files to upload!')
  }
}

const handleFileUpload = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file.name.includes('.xlsx')) {
      reject(new Error('Please input file with format .xlsx'))
    }
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const json = await processFileData(data)
        await validateData(json)
        resolve(true)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = (e) => {
      modalStore.openMessageModal('Failed', 'Error reading file')
      reject(new Error("Could not read file"))
    }

    try {
      reader.readAsArrayBuffer(file)
    } catch (err) {
      console.error("❌ Exception while reading:", err)
      reject(err)
    }
  })
}

const processFileData = async (data) => {
  const workbook = XLSX.read(data, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]

  const json = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    header: [
      'id', 'sparepart_number', 'sparepart_name', 'purchase_price', 'seller', 'discount'
    ]
  })

  return json
}

const validateData = async (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Excel file is empty or invalid format')
  }
  const expectedHeaders = ['sparepart_number', 'sparepart_name', 'purchase_price', 'seller']

  // Get headers from first row
  const headers = Object.keys(data[0])

  // Check if all required headers are present
  const missingHeaders = expectedHeaders.filter(header => !headers.includes(header))
  if (missingHeaders.length > 0) {
    throw new Error(`Missing columns: ${missingHeaders.join(', ')}`)
  }

  const subheader = data[1]
  if (!subheader['sparepart_name']) throw new Error('Please remove the subheader from excel')

  const contain = data.slice(1)
  contain.forEach(item => {
    if (![1, 2, 3].includes(item['seller'])) throw new Error('Please input seller between 1, 2, 3 based on seller name')
  })
}
</script>

<style lang="scss" scoped>
@use '@/assets/css/background-page.scss';
@use '@/assets/css/loader.scss';

$primary-color: #2e2e2e;

.contain {
  display: flex;
  height: 78vh;
  flex-direction: column;
  padding: 40px;

  // .top {
  //   display: flex;
  // }
}

.upload {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: 50%;
  margin-top: 2%;
  // align-self: center;
  gap: 10px;
  width: 100%;

  .dropzone {
    border: 2px dashed $primary-color;
    border-radius: 20px;
    height: 100%;
    width: 70%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

  }

  .icon {
    margin: 3px;
  }

  .text {
    margin: 5px;
  }

  .btn {
    display: flex;
    background-color: $primary-color;
  }

  .file {
    color: #979797;
  }
}

.submit {
  display: flex;
  justify-content: center;

  .btn {
    color: white;
    padding: 7px 40px;
  }
}

.progress {
  position: absolute;
  width: 40%;
  margin: 0;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

@media only screen and (max-width: 769px) {
  .contain {
    .up {
      .title {
        font-size: 3.5vw;
      }
    }

    .input-form {
      height: 74vh;
      margin: 2% 5% 2% 5%;
      padding: 20px;

      .top {
        display: flex;
        flex-direction: column;

        .right {
          justify-content: center;
          margin: 0%;
        }
      }
    }

    .upload {
      width: 60vw;
      margin: 10px;
    }

    .submit {
      margin-top: 10px;
    }
  }
}

@media only screen and (max-width: 767px) {

  /* For mobile phones: */
  .contain {
    .up .title {
      font-size: 5vw;
    }

    .input-form {
      height: 80vh;
      margin: 5% 6% 0% 6%;
      padding: 20px;
    }

    .example-table {
      width: 280px;
    }

    .upload {
      margin: 10px;
      width: 60vw;

      .btn {
        margin: 10px;
      }

      .file {
        margin-top: -20px;
        margin-bottom: 10px;
      }
    }

    .submit {
      margin: 0px;
    }
  }
}
</style>
