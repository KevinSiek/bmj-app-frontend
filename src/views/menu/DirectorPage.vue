<template>
  <div class="w-64">
    <div class="relative">
      <!-- Input Field -->
      <input v-model="searchQuery" @focus="dropdownOpen = true" @input="filterItems" class="w-full p-2 border rounded"
        type="text" placeholder="Search..." />
      <!-- Dropdown List -->
      <div v-if="dropdownOpen && filteredItems.length" class="absolute z-10 w-full mt-1 bg-white border rounded shadow">
        <ul>
          <li v-for="item in filteredItems" :key="item.id" @click="selectItem(item)"
            class="p-2 hover:bg-gray-200 cursor-pointer">
            {{ item.name }}
          </li>
        </ul>
      </div>
    </div>
    <!-- Selected Item -->
    <div v-if="selectedItem" class="mt-2 text-sm text-gray-600">
      Selected: {{ selectedItem.name }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: "",
      dropdownOpen: false,
      items: [
        { id: 1, name: "Apple" },
        { id: 2, name: "Banana" },
        { id: 3, name: "Cherry" },
        { id: 4, name: "Date" },
        { id: 5, name: "Elderberry" },
      ],
      filteredItems: [],
      selectedItem: null,
    };
  },
  methods: {
    filterItems() {
      if (this.searchQuery.trim() === "") {
        this.filteredItems = this.items;
      } else {
        const query = this.searchQuery.toLowerCase();
        this.filteredItems = this.items.filter((item) =>
          item.name.toLowerCase().includes(query)
        );
      }
    },
    selectItem(item) {
      this.selectedItem = item;
      this.searchQuery = item.name;
      this.dropdownOpen = false;
    },
  },
  mounted() {
    this.filteredItems = this.items; // Initialize filtered items
  },
};
</script>

<style scoped>
/* Optional styling */
</style>
