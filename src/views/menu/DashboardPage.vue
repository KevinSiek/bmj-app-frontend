<template>

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

<style lang="scss" scoped>
$primary-color: black;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.main {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

ul {
  display: flex;
}

ul li {
  width: 200px;
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

ul li .icons {
  font-size: 25px;
  color: $primary-color;
}

ul li .label {
  font-family: sans-serif;
  letter-spacing: 1px;
  font-size: 14px;
  font-weight: bold;
  color: #d7d7c3;
}

ul li .label .active {
  font-family: sans-serif;
  letter-spacing: 1px;
  font-size: 14px;
  font-weight: bold;
  color: #1b761b;
}

ul li .step {
  height: 30px;
  width: 30px;
  border-radius: 50%;
  background-color: #d7d7c3;
  margin: 16px 0 10px;
  display: grid;
  place-items: center;
  color: ghostwhite;
  position: relative;
  cursor: pointer;
}

.step::after {
  content: "";
  position: absolute;
  width: 170px;
  height: 3.5px;
  background-color: #d7d7c3;
  right: 30px;
}

.first::after {
  width: 0;
  height: 0;
}

ul li .step .awesome {
  display: none;
}

ul li .step p {
  font-size: 18px;
}

ul li .active {
  background-color: $primary-color;
}

li .active::after {
  background-color: $primary-color;
}

ul li .text-active {
  color: $primary-color;
}

ul li .active p {
  display: none;
}

ul li .active .awesome {
  display: flex;
}
</style>
