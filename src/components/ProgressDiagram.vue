<template>
  <div class="main">
    <ul>
      <li>
        <i class="icons awesome fa-solid fa-user"></i>
        <div class="step first active">
          <p>1</p>
          <i class="awesome bi bi-check-lg"></i>
        </div>
        <p class="label text-active">PO</p>
      </li>
      <li>
        <i class="icons awesome fa-solid fa-coins"></i>
        <div class="step second active">
          <p>2</p>
          <i class="awesome bi bi-check-lg"></i>
        </div>
        <p class="label text-active">PI | Inventory</p>
      </li>
      <li>
        <i class="icons awesome fa-solid fa-house"></i>
        <div class="step third active">
          <p>3</p>
          <i class="awesome bi bi-check-lg"></i>
        </div>
        <p class="label text-active">Paid</p>
      </li>
      <li>
        <i class="icons awesome fa-regular fa-star-half-stroke"></i>
        <div class="step fourth active">
          <p>4</p>
          <i class="awesome bi bi-check-lg"></i>
        </div>
        <p class="label text-active">Sent</p>
      </li>
      <li>
        <i class="icons awesome fa-solid fa-thumbs-up"></i>
        <div class="step fifth">
          <p>5</p>
          <i class="awesome bi bi-check-lg"></i>
        </div>
        <p class="label">Done</p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {

}
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
